import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppointmentCreateDto } from '../dto/appointment.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('doctor')
  async createAppointment(
    @Body() body: AppointmentCreateDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.createAppointment(body, loginUser);
  }

  @Get()
  @ApiQuery({ name: 'type', enum: ['doctor', 'patient'] })
  async getAppointments(
    @Query('type') type: 'doctor' | 'patient',
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.getAppointments(type, loginUser);
  }

  @Get(':appointmentId/messages')
  async getAppointmentMessages(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.getAppointmentMessages(
      appointmentId,
      loginUser,
    );
  }
}
