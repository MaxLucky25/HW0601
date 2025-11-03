import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../../core/database/base.entity';
import { CreateUserDomainDto } from '../dto/create-user.domain.dto';
import { randomUUID } from 'crypto';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  login: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  email: string;

  @Column({ name: 'is_email_confirmed', default: false })
  isEmailConfirmed: boolean;

  /**
   * Статический метод для создания нового пользователя
   */
  static create(dto: CreateUserDomainDto): User {
    const user = new User();
    user.id = randomUUID();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.isEmailConfirmed = false;
    user.deletedAt = null;
    // createdAt и updatedAt установятся автоматически через @CreateDateColumn и @UpdateDateColumn

    return user;
  }

  /**
   * Подтвердить email пользователя
   */
  confirmEmail(): void {
    this.isEmailConfirmed = true;
  }

  /**
   * Обновить пароль пользователя
   */
  updatePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Обновить логин и email
   */
  updateLoginAndEmail(login: string, email: string): void {
    this.login = login;
    this.email = email;
    // updatedAt обновится автоматически через @UpdateDateColumn
  }

  /**
   * Выполнить мягкое удаление (soft delete)
   */
  softDelete(): void {
    this.deletedAt = new Date();
    // updatedAt обновится автоматически через @UpdateDateColumn
  }
  /**
   * Проверить, подтвержден ли email
   */
  hasEmailConfirmed(): boolean {
    return this.isEmailConfirmed;
  }
}
