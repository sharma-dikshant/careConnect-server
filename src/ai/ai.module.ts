import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CreditsService } from 'src/credits/credits.service';

@Module({
  providers: [AiService, CreditsService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
