import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly MessagesService: MessagesService) {}

  @Post('/appointments/:appointmentId')
  @Roles('patient')
  async sendMessage(
    @Body() body: MessageCreateDto,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.MessagesService.sendBotMessage(body, loginUser, appointmentId);
  }

  @Get('/appointments/:appointmentId')
  async getMessages(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ) {
    return { data: `all Messages of ${appointmentId}` };
  }
}
