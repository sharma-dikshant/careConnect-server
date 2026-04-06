import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { CareProtocolsModule } from './care_protocols/care_protocols.module';
import { MessagesModule } from './messages/messages.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { S3Module } from './utils/s3.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OtpModule } from './otp/otp.module';
import { AiModule } from './ai/ai.module';
import { CreditsModule } from './credits/credits.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SeedModule } from './seed/seed.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({ isGlobal: true }),
    DatabaseModule,
    S3Module,
    AuthModule,
    UsersModule,
    PatientsModule,
    CareProtocolsModule,
    MessagesModule,
    AppointmentsModule,
    OtpModule,
    AiModule,
    CreditsModule,
    SubscriptionsModule,
    SeedModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
