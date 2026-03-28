import { Controller, Post, UseGuards } from '@nestjs/common';
import { RequiredCredits } from 'src/common/decorators/required-credits.decorator';
import { CreditGuard } from 'src/common/guards/credit.guard';

@Controller('ai')
export class AiController {
  @UseGuards(CreditGuard)
  @RequiredCredits(5)
  @Post('/generate-patient-guide')
  generatePatientGuide() {
    return 'generating patient Guide';
  }
}
