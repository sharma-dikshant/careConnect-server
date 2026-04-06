import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RequiredCredits } from 'src/common/decorators/required-credits.decorator';
import { CreditGuard } from 'src/common/guards/credit.guard';
import { AiService } from './ai.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AccessTokenPayloadDto } from 'src/dto/auth.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/ai')
@ApiBearerAuth('JWT-auth')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @UseGuards(CreditGuard)
  @Roles('doctor')
  @RequiredCredits(5)
  @Post('/generate-patient-guide')
  @HttpCode(200)
  generatePatientGuide(
    @Body() dto: { prompt: string },
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ) {
    return this.aiService.generatePatientGuide(dto.prompt, loginUser);
  }
}
