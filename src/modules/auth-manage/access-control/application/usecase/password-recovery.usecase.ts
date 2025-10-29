import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDto } from '../../api/input-dto/password-recovery.input.dto';
import { AuthService } from '../auth.service';
import { EmailService } from '../helping-application/email.service';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { PasswordRecoveryRepository } from '../../../user-accounts/infrastructure/password-recovery.repository';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class PasswordRecoveryCommand {
  constructor(public readonly dto: PasswordRecoveryInputDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail({
      email: command.dto.email,
    });
    if (user) {
      const expiration = this.authService.getExpiration(
        'PASSWORD_RECOVERY_EXPIRATION',
      );

      const recoveryCode = randomUUID();
      const expirationDate = add(new Date(), { minutes: expiration });

      // Создаем или обновляем recovery код
      await this.passwordRecoveryRepository.updatePasswordRecovery({
        userId: user.id,
        recoveryCode,
        expirationDate,
      });

      // Отправляем email
      await this.emailService.sendRecoveryEmail(user.email, recoveryCode);
    }
    return;
  }
}
