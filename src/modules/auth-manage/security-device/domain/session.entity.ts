import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { CreateSessionDomainDto } from './dto/create-session.domain.dto';
import { User } from '../../user-accounts/domain/entities/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id: string;

  @Column()
  token: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column()
  ip: string;

  @Column({ name: 'user_agent' })
  userAgent: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({ name: 'last_active_date', type: 'timestamp' })
  lastActiveDate: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  /**
   * Статический метод для создания новой сессии
   */
  static createSession(dto: CreateSessionDomainDto): Session {
    const session = new Session();
    session.id = randomUUID();
    session.token = dto.token;
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.ip = dto.ip;
    session.userAgent = dto.userAgent;
    session.lastActiveDate = new Date();
    session.expiresAt = new Date(Date.now() + dto.expiresIn);
    session.isRevoked = false;
    // createdAt установится автоматически через @CreateDateColumn

    return session;
  }

  /**
   * Обновить дату последней активности
   */
  updateLastActiveDate(): void {
    this.lastActiveDate = new Date();
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Обновить токен
   */
  updateToken(newToken: string): void {
    this.token = newToken;
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Обновить дату истечения
   */
  updateExpiresAt(expiresIn: number): void {
    this.expiresAt = new Date(Date.now() + expiresIn);
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Отозвать сессию
   */
  revoke(): void {
    this.isRevoked = true;
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Проверить, истекла ли сессия
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Проверить, активна ли сессия (не отозвана и не истекла)
   */
  isActive(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
