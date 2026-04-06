import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../entities/subscription.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Subscription])],
  providers: [SeedService],
})
export class SeedModule {}
