import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditService: CreditsService) {}
  @Post('/add/users/:userId')
  @HttpCode(200)
  addCredits(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { credits: number; expiry: number },
  ) {
    return this.creditService.addUserCredits(userId, dto.credits, dto.expiry);
  }
}
