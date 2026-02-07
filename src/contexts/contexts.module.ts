import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextsService } from './contexts.service';
import { ContextsController } from './contexts.controller';
import { GlobalContext } from '../entities/global-context.entity';
import { LocalContext } from '../entities/local-context.entity';
import { Appointment } from '../entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalContext, LocalContext, Appointment])],
  controllers: [ContextsController],
  providers: [ContextsService],
})
export class ContextsModule {}
