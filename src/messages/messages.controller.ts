import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { Public } from 'src/auth/decorators/public.decorator';

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
    return this.MessagesService.sendBotMessage(
      body,
      loginUser.id,
      appointmentId,
    );
  }

  @Get('/appointments/:appointmentId')
  @ApiOperation({
    summary:
      'Get all messages for an appointment (doctor or patient in the appointment)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getMessages(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Query() pagination: PaginationDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.MessagesService.getMessages(
      appointmentId,
      loginUser,
      pagination,
    );
  }

  /**
   * Api for hardware support
   */
  @Post('/device')
  @HttpCode(200)
  @Public()
  async sendMessageByDevice(
    @Headers('X-Device-Token') deviceToken: string,
    @Body() body: MessageCreateDto,
  ) {
    if (!deviceToken) {
      throw new BadRequestException('missing headers');
    }
    return this.MessagesService.sendBotMessageByDevice(deviceToken, body);
  }
}
