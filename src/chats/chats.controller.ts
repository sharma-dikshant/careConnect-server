import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/chats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post(':appointmentId')
  @Roles('patient')
  async sendMessage(
    @Body() body: MessageCreateDto,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    if (loginUser.role !== 'patient') {
      throw new HttpException('this service is only for patients', HttpStatus.BAD_REQUEST);
    }
    return this.chatsService.sendBotMessage(body, loginUser, appointmentId);
  }

  @Get(':appointmentId')
  async getMessages(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    return { data: `all chats of ${appointmentId}` };
  }
}
