import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDeviceRepository } from '../../infrastructure/security-device.repository';
import { FindByUserIdDto } from '../../infrastructure/dto/session-repo.dto';
import { DeviceViewDto } from '../../api/view-dto/device.view-dto';

export class GetUserDevicesQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserDevicesQuery)
export class GetUserDevicesQueryUseCase
  implements IQueryHandler<GetUserDevicesQuery, DeviceViewDto[]>
{
  constructor(private securityDeviceRepository: SecurityDeviceRepository) {}

  async execute(query: GetUserDevicesQuery): Promise<DeviceViewDto[]> {
    const { userId } = query;

    const findDto: FindByUserIdDto = { userId };
    const sessions = await this.securityDeviceRepository.findByUserId(findDto);

    // Фильтруем только активные сессии
    const activeSessions = sessions.filter((session) => session.isActive());

    // Преобразуем в DeviceViewDto
    return activeSessions.map((session) => DeviceViewDto.mapToView(session));
  }
}
