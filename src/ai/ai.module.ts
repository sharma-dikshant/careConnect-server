import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CreditsModule } from 'src/credits/credits.module';

@Module({
  imports: [CreditsModule],
  providers: [AiService, CreditsModule],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
