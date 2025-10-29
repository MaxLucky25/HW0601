import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FindByIdDto } from '../../infrastructure/dto/repoDto';
import { UsersRepository } from '../../infrastructure/user.repository';

export class DeleteUserCommand {
  constructor(public readonly id: FindByIdDto) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    await this.usersRepository.findOrNotFoundFail({
      id: command.id.id,
    });

    await this.usersRepository.deleteUser(command.id.id);
  }
}
