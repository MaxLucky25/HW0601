import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { RawPasswordRecoveryRow } from '../../../../core/database/types/sql.types';
import {
  FindByRecoveryCodeDto,
  UpdatePasswordRecoveryDto,
  ConfirmPasswordRecoveryDto,
} from './dto/password-recovery.dto';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByRecoveryCode(
    dto: FindByRecoveryCodeDto,
  ): Promise<RawPasswordRecoveryRow | null> {
    const query = `
      SELECT * FROM password_recoveries
      WHERE recovery_code = $1
    `;
    const result = await this.databaseService.query<RawPasswordRecoveryRow>(
      query,
      [dto.recoveryCode],
    );
    return result.rows[0] || null;
  }

  async updatePasswordRecovery(dto: UpdatePasswordRecoveryDto): Promise<void> {
    const query = `
      UPDATE password_recoveries 
      SET 
        recovery_code = $2,
        expiration_date = $3,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [
      dto.userId,
      dto.recoveryCode,
      dto.expirationDate,
    ]);
  }

  async confirmPasswordRecovery(
    dto: ConfirmPasswordRecoveryDto,
  ): Promise<void> {
    const query = `
      UPDATE password_recoveries 
      SET 
        is_confirmed = true,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [dto.userId]);
  }
}
