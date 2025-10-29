import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { RawSessionRow } from '../../../../core/database/types/sql.types';
import { Session, SessionDocument } from '../domain/session.entity';
import {
  FindByUserIdDto,
  RevokeAllUserSessionsExceptCurrentDto,
  FindByUserAndDeviceDto,
} from './dto/session-repo.dto';
import { CreateSessionDomainDto } from '../domain/dto/create-session.domain.dto';

@Injectable()
export class SecurityDeviceRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // Основной метод для refresh flow - поиск по userId + deviceId
  async findByUserAndDevice(
    dto: FindByUserAndDeviceDto,
  ): Promise<SessionDocument | null> {
    const query = `
      SELECT * FROM sessions 
      WHERE user_id = $1 
        AND device_id = $2 
        AND is_revoked = false 
        AND expires_at > NOW()
    `;
    const result = await this.databaseService.query<RawSessionRow>(query, [
      dto.userId,
      dto.deviceId,
    ]);
    return result.rows[0] ? this.mapToSession(result.rows[0]) : null;
  }

  // Метод для поиска сессии только по deviceId (для проверки прав доступа)
  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    const query = `
      SELECT * FROM sessions 
      WHERE device_id = $1 AND is_revoked = false
    `;
    const result = await this.databaseService.query<RawSessionRow>(query, [
      deviceId,
    ]);
    return result.rows[0] ? this.mapToSession(result.rows[0]) : null;
  }

  async findByUserId(dto: FindByUserIdDto): Promise<SessionDocument[]> {
    const query = `
      SELECT * FROM sessions 
      WHERE user_id = $1 
        AND is_revoked = false 
        AND expires_at > NOW()
      ORDER BY last_active_date DESC
    `;
    const result = await this.databaseService.query<RawSessionRow>(query, [
      dto.userId,
    ]);
    return result.rows.map((row) => this.mapToSession(row));
  }

  async createSession(dto: CreateSessionDomainDto): Promise<SessionDocument> {
    const session = Session.createSession(dto);
    const query = `
      INSERT INTO sessions (
        id, token, user_id, device_id, ip, user_agent, 
        created_at, last_active_date, expires_at, is_revoked
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *
    `;
    const result = await this.databaseService.query<RawSessionRow>(query, [
      session.id,
      session.token,
      session.userId,
      session.deviceId,
      session.ip,
      session.userAgent,
      session.createdAt,
      session.lastActiveDate,
      session.expiresAt,
      session.isRevoked,
    ]);
    return this.mapToSession(result.rows[0]);
  }

  async save(session: SessionDocument): Promise<SessionDocument> {
    const query = `
      UPDATE sessions 
      SET 
        token = $2,
        last_active_date = $3,
        expires_at = $4,
        is_revoked = $5
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.databaseService.query<RawSessionRow>(query, [
      session.id,
      session.token,
      session.lastActiveDate,
      session.expiresAt,
      session.isRevoked,
    ]);
    return this.mapToSession(result.rows[0]);
  }

  // Обновленный метод - отзыв по userId + deviceId вместо токена
  async revokeSessionByUserAndDevice(
    dto: FindByUserAndDeviceDto,
  ): Promise<void> {
    const session = await this.findByUserAndDevice(dto);
    if (session) {
      session.revoke();
      await this.save(session);
    }
  }

  async revokeAllUserSessionsExceptCurrent(
    dto: RevokeAllUserSessionsExceptCurrentDto,
  ): Promise<void> {
    const sessions = await this.findByUserId({ userId: dto.userId });
    const sessionsToRevoke = sessions.filter(
      (session) => session.deviceId !== dto.currentDeviceId,
    );

    for (const session of sessionsToRevoke) {
      session.revoke();
      await this.save(session);
    }
  }

  private mapToSession(row: RawSessionRow): Session {
    const session = new Session();
    session.id = row.id;
    session.token = row.token;
    session.userId = row.user_id;
    session.deviceId = row.device_id;
    session.ip = row.ip;
    session.userAgent = row.user_agent;
    session.createdAt = row.created_at;
    session.lastActiveDate = row.last_active_date;
    session.expiresAt = row.expires_at;
    session.isRevoked = row.is_revoked;
    return session;
  }
}
