import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../api/input-dto/new-password.input.dto';
import { BcryptService } from '../helping-application/bcrypt.service';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { PasswordRecoveryRepository } from '../../../user-accounts/infrastructure/password-recovery.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class NewPasswordCommand {
  constructor(public readonly dto: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const passwordRecovery =
      await this.passwordRecoveryRepository.findByRecoveryCode({
        recoveryCode: command.dto.recoveryCode,
      });

    if (!passwordRecovery) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Recovery code is not valid',
        field: 'recoveryCode',
      });
    }

    // Проверяем, что код не истек
    if (passwordRecovery.expiration_date <= new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Recovery code is not valid',
        field: 'recoveryCode',
      });
    }

    // Проверяем, что код уже подтвержден
    if (passwordRecovery.is_confirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Recovery code is not valid',
        field: 'recoveryCode',
      });
    }

    const newPasswordHash = await this.bcryptService.generateHash({
      password: command.dto.newPassword,
    });

    // Обновляем пароль через репозиторий
    await this.usersRepository.updateUserPassword(
      passwordRecovery.user_id,
      newPasswordHash,
    );

    // Подтверждаем recovery код
    await this.passwordRecoveryRepository.confirmPasswordRecovery({
      userId: passwordRecovery.user_id,
    });

    return;
  }
}
