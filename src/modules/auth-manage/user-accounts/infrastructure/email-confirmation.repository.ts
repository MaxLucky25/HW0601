import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { RawEmailConfirmationRow } from '../../../../core/database/types/sql.types';
import {
  ConfirmEmailConfirmationDto,
  CreateEmailConfirmationDto,
  FindByConfirmationCodeDto,
  UpdateEmailConfirmationDto,
} from './dto/email-confirmation.dto';

@Injectable()
export class EmailConfirmationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createEmailConfirmation(
    dto: CreateEmailConfirmationDto,
  ): Promise<void> {
    const query = `
      INSERT INTO email_confirmations (
        user_id, confirmation_code, expiration_date, is_confirmed, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, NOW(), NOW()
      )
    `;
    await this.databaseService.query(query, [
      dto.userId,
      dto.confirmationCode,
      dto.expirationDate,
      dto.isConfirmed,
    ]);
  }

  async findByConfirmationCode(
    dto: FindByConfirmationCodeDto,
  ): Promise<RawEmailConfirmationRow | null> {
    const query = `
      SELECT * FROM email_confirmations
      WHERE confirmation_code = $1
    `;
    const result = await this.databaseService.query<RawEmailConfirmationRow>(
      query,
      [dto.confirmationCode],
    );
    return result.rows[0] || null;
  }

  async updateEmailConfirmation(
    dto: UpdateEmailConfirmationDto,
  ): Promise<void> {
    const query = `
      UPDATE email_confirmations 
      SET 
        confirmation_code = $2,
        expiration_date = $3,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [
      dto.userId,
      dto.confirmationCode,
      dto.expirationDate,
    ]);
  }

  async confirmEmailConfirmation(
    dto: ConfirmEmailConfirmationDto,
  ): Promise<void> {
    const query = `
      UPDATE email_confirmations 
      SET 
        is_confirmed = true,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [dto.userId]);
  }
}
