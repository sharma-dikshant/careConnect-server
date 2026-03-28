import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RequiredCredits } from 'src/common/decorators/required-credits.decorator';
import { CreditGuard } from 'src/common/guards/credit.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/ai')
@ApiBearerAuth('JWT-auth')
export class AiController {
  @UseGuards(CreditGuard)
  @Roles('doctor')
  @RequiredCredits(5)
  @Post('/generate-patient-guide')
  generatePatientGuide() {
    return 'generating patient Guide';
  }
}
