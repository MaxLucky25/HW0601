import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './exceptions/filters/all-exception.filter';
import { DomainHttpExceptionsFilter } from './exceptions/filters/domain-exceptions.filter';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UuidValidationTransformationPipe } from './pipes/uuid-validator-transformation-pipe-service';
import { UuidValidationPipe } from './pipes/uuid-validator-transformation-pipe-service';
import { DatabaseService } from './database/database.service';

@Global()
@Module({
  providers: [
    // Глобальные фильтры исключений
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    // Глобальный guard для throttling
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Pipes для валидации UUID
    UuidValidationTransformationPipe,
    UuidValidationPipe,
    // Database service для работы с PostgresSQL
    DatabaseService,
  ],
  exports: [
    // Экспортируем pipes для использования в других модулях
    UuidValidationTransformationPipe,
    UuidValidationPipe,
    // Экспортируем DatabaseService
    DatabaseService,
  ],
})
export class CoreModule {}
