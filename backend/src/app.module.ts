import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuestsModule } from './guests/guests.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { EventsModule } from './events/events.module';
import { InventoryModule } from './inventory/inventory.module';
import { HousekeepingModule } from './housekeeping/housekeeping.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { EmployeesModule } from './employees/employees.module';
import { ReportsModule } from './reports/reports.module';
import { CmsModule } from './cms/cms.module';
import { SettingsModule } from './settings/settings.module';
import { PublicModule } from './public/public.module';
import { MailModule } from './common/mail/mail.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { StorageModule } from './common/storage/storage.module';
import { TrashModule } from './trash/trash.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GuestsModule,
    RoomsModule,
    ReservationsModule,
    PaymentsModule,
    RestaurantModule,
    EventsModule,
    InventoryModule,
    HousekeepingModule,
    MaintenanceModule,
    EmployeesModule,
    ReportsModule,
    CmsModule,
    SettingsModule,
    PublicModule,
    TrashModule,
    HealthModule,
    LoggerModule,
    StorageModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
