import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationEmailResendingInputDto } from '../../api/input-dto/registration-email-resending.input.dto';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { EmailConfirmationRepository } from '../../../user-accounts/infrastructure/email-confirmation.repository';
import { EmailService } from '../helping-application/email.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { AuthService } from '../auth.service';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class RegistrationEmailResendingCommand {
  constructor(public readonly dto: RegistrationEmailResendingInputDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private emailService: EmailService,
    private authService: AuthService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail({
      email: command.dto.email,
    });

    if (!user || user.is_email_confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmed,
        message: 'Email already confirmed',
        field: 'email',
      });
    }

    const expiration = this.authService.getExpiration(
      'EMAIL_CONFIRMATION_EXPIRATION',
    );

    const confirmationCode = randomUUID();
    const expirationDate = add(new Date(), { minutes: expiration });

    // Обновляем код подтверждения
    await this.emailConfirmationRepository.updateEmailConfirmation({
      userId: user.id,
      confirmationCode,
      expirationDate,
    });

    // Отправляем email
    await this.emailService.sendConfirmationEmail(user.email, confirmationCode);

    return;
  }
}
