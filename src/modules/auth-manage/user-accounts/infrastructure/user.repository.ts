import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CreateUserDomainDto } from '../api/input-dto/create-user.domain.dto';
import { UpdateUserInputDto } from '../api/input-dto/update-user.input.dto';
import {
  FindByEmailDto,
  FindByIdDto,
  FindByLoginOrEmailDto,
} from './dto/repoDto';
import { RawUserRow } from '../../../../core/database/types/sql.types';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(dto: FindByIdDto): Promise<RawUserRow | null> {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.id,
    ]);
    return result.rows[0] || null;
  }

  async findOrNotFoundFail(dto: FindByIdDto): Promise<RawUserRow> {
    const user = await this.findById(dto);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found!',
        field: 'User',
      });
    }

    return user;
  }

  async findByEmail(dto: FindByEmailDto): Promise<RawUserRow | null> {
    const query = `
      SELECT * FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.email,
    ]);
    return result.rows[0] || null;
  }

  async findByLoginOrEmail(
    dto: FindByLoginOrEmailDto,
  ): Promise<RawUserRow | null> {
    const query = `
      SELECT * FROM users
      WHERE (login = $1 OR email = $1) AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.loginOrEmail,
    ]);
    return result.rows[0] || null;
  }

  async createUser(dto: CreateUserDomainDto): Promise<RawUserRow> {
    const userId = randomUUID();
    const query = `
      INSERT INTO users (
        id, login, password_hash, email, is_email_confirmed,
        created_at, updated_at, deleted_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW(), $6
      )
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      userId,
      dto.login,
      dto.passwordHash,
      dto.email,
      false, // is_email_confirmed
      null, // deleted_at
    ]);
    return result.rows[0];
  }

  async updateUser(id: string, dto: UpdateUserInputDto): Promise<RawUserRow> {
    const query = `
      UPDATE users 
      SET email = $2, login = $3, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      dto.email,
      dto.login,
    ]);
    return result.rows[0];
  }

  async deleteUser(id: string): Promise<RawUserRow> {
    const query = `
      UPDATE users 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [id]);
    return result.rows[0];
  }

  async updateUserPassword(
    id: string,
    passwordHash: string,
  ): Promise<RawUserRow> {
    const query = `
      UPDATE users 
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      passwordHash,
    ]);
    return result.rows[0];
  }

  async updateUserEmailConfirmed(
    id: string,
    isEmailConfirmed: boolean,
  ): Promise<RawUserRow> {
    const query = `
      UPDATE users 
      SET is_email_confirmed = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      isEmailConfirmed,
    ]);
    return result.rows[0];
  }
}
