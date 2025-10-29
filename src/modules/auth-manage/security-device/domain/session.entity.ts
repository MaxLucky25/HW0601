import { randomUUID } from 'crypto';
import { CreateSessionDomainDto } from './dto/create-session.domain.dto';

export class Session {
  id: string;
  token: string;
  userId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  lastActiveDate: Date;
  expiresAt: Date;
  isRevoked: boolean;

  static createSession(dto: CreateSessionDomainDto): Session {
    const session = new this();
    session.id = randomUUID();
    session.token = dto.token;
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.ip = dto.ip;
    session.userAgent = dto.userAgent;
    session.createdAt = new Date();
    session.lastActiveDate = new Date();
    session.expiresAt = new Date(Date.now() + dto.expiresIn);
    session.isRevoked = false;

    return session;
  }

  updateLastActiveDate() {
    this.lastActiveDate = new Date();
  }

  updateToken(newToken: string) {
    this.token = newToken;
  }

  updateExpiresAt(expiresIn: number) {
    this.expiresAt = new Date(Date.now() + expiresIn);
  }

  revoke() {
    this.isRevoked = true;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}

// Убираем Mongoose типы - работаем с raw SQL
export type SessionDocument = Session;
