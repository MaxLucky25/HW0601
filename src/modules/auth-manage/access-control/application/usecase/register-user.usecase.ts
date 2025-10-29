import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../user-accounts/api/input-dto/users.input-dto';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { EmailConfirmationRepository } from '../../../user-accounts/infrastructure/email-confirmation.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Extension } from '../../../../../core/exceptions/domain-exceptions';
import { EmailService } from '../helping-application/email.service';
import { BcryptService } from '../helping-application/bcrypt.service';
import { ConfigService } from '@nestjs/config';
import { add } from 'date-fns';
import { randomUUID } from 'crypto';

export class RegistrationUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private emailService: EmailService,
    private bcryptService: BcryptService,
    private configService: ConfigService,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<void> {
    // Проверяем, что пользователь не существует
    const [byLogin, byEmail] = await Promise.all([
      this.usersRepository.findByLoginOrEmail({
        loginOrEmail: command.dto.login,
      }),
      this.usersRepository.findByLoginOrEmail({
        loginOrEmail: command.dto.email,
      }),
    ]);

    if (byLogin || byEmail) {
      const extensions: Extension[] = [];
      if (byLogin) {
        extensions.push(new Extension('Login already exists', 'login'));
      }
      if (byEmail) {
        extensions.push(new Extension('Email already exists', 'email'));
      }
      throw new DomainException({
        code: DomainExceptionCode.AlreadyExists,
        message: 'Login or Email already exists!',
        field: extensions.length === 1 ? extensions[0].key : '',
        extensions,
      });
    }

    // Хешируем пароль
    const passwordHash = await this.bcryptService.generateHash({
      password: command.dto.password,
    });

    // Создаем пользователя
    const user = await this.usersRepository.createUser({
      login: command.dto.login,
      email: command.dto.email,
      passwordHash,
    });

    // Создаем email confirmation
    const expirationMinutes = this.configService.get<number>(
      'EMAIL_CONFIRMATION_EXPIRATION',
    );

    if (!expirationMinutes) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'EMAIL_CONFIRMATION_EXPIRATION is not set',
        field: 'ConfigValue',
      });
    }

    const confirmationCode = randomUUID();
    const expirationDate = add(new Date(), { minutes: expirationMinutes });

    await this.emailConfirmationRepository.createEmailConfirmation({
      userId: user.id,
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    });

    // Отправляем email
    await this.emailService.sendConfirmationEmail(user.email, confirmationCode);
  }
}
