import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Balance } from 'src/entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Balance])],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
