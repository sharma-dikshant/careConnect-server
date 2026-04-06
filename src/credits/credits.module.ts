import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from 'src/entities/balance.entity';
import { CreditsController } from './credits.controller';
import { Doctor } from '@entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Balance, Doctor])],
  providers: [CreditsService],
  exports: [CreditsService],
  controllers: [CreditsController],
})
export class CreditsModule {}
