import { Module } from '@nestjs/common';
import { UsersController } from './api/user.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/user.repository';
import { EmailConfirmationRepository } from './infrastructure/email-confirmation.repository';
import { PasswordRecoveryRepository } from './infrastructure/password-recovery.repository';
import { HelpingApplicationModule } from '../access-control/application/helping-application/helping-application.module';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllUsersQueryUseCase } from './application/query-usecase/get-all-users.usecase';
import { GetUserByIdUseCase } from './application/query-usecase/get-user-by-id.usecase';
import { CreateUserUseCase } from './application/usecase/create-user.usecase';
import { UpdateUserUseCase } from './application/usecase/update-user.usecase';
import { DeleteUserUseCase } from './application/usecase/delete-user.usecase';

const QueryHandler = [GetAllUsersQueryUseCase, GetUserByIdUseCase];

const CommandHandler = [
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
];
@Module({
  imports: [CqrsModule, HelpingApplicationModule],
  controllers: [UsersController],
  providers: [
    ...CommandHandler,
    ...QueryHandler,
    UsersQueryRepository,
    UsersRepository,
    EmailConfirmationRepository,
    PasswordRecoveryRepository,
  ],
  exports: [
    UsersRepository,
    EmailConfirmationRepository,
    PasswordRecoveryRepository,
  ],
})
export class UsersAccountModule {}
