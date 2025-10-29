import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationConfirmationInputDto } from '../../api/input-dto/registration-confirmation.input.dto';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { EmailConfirmationRepository } from '../../../user-accounts/infrastructure/email-confirmation.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class RegistrationConfirmationCommand {
  constructor(public readonly dto: RegistrationConfirmationInputDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUserUseCase
  implements ICommandHandler<RegistrationConfirmationCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const emailConfirmation =
      await this.emailConfirmationRepository.findByConfirmationCode({
        confirmationCode: command.dto.code,
      });

    // Проверяем, что emailConfirmation существует
    if (!emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что код уже подтвержден
    if (emailConfirmation.is_confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что код не истек
    if (emailConfirmation.expiration_date <= new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Получаем пользователя для проверки статуса
    const user = await this.usersRepository.findById({
      id: emailConfirmation.user_id,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Проверяем, что пользователь уже подтвержден
    if (user.is_email_confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Confirmation code is not valid',
        field: 'code',
      });
    }

    // Обновляем статус подтверждения пользователя
    await this.usersRepository.updateUserEmailConfirmed(user.id, true);

    // Подтверждаем код
    await this.emailConfirmationRepository.confirmEmailConfirmation({
      userId: user.id,
    });

    return;
  }
}
