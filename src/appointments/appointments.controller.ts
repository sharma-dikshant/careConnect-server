import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  AppointmentCreateDto,
  AppointmentUpdateDto,
} from '../dto/appointment.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginationDto } from '../dto/pagination.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getAppointments(
    @Query() pagination: PaginationDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.getAppointments(loginUser, pagination);
  }

  @Patch(':appointmentId')
  @Roles('doctor')
  @ApiOperation({
    summary: 'Update appointment title/description (doctor only)',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateAppointment(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() body: AppointmentUpdateDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.updateAppointment(
      appointmentId,
      body,
      loginUser,
    );
  }

  @Delete(':appointmentId')
  @Roles('doctor')
  @ApiOperation({ summary: 'Soft delete an appointment (doctor only)' })
  async deleteAppointment(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.appointmentsService.deleteAppointment(appointmentId, loginUser);
  }
}
