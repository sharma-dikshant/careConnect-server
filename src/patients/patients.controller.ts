import { Controller, Post, Get, Put, Delete, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PatientCreateDto, PatientUpdateDto } from '../dto/patient.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('doctor')
  async addPatient(
    @Body() body: PatientCreateDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.addPatient(body, loginUser);
  }

  @Get('all/:doctorId')
  @Roles('doctor')
  async getAllPatients(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.getAllPatients(doctorId, loginUser);
  }

  @Get(':patientId')
  @Roles('doctor')
  async getPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.getPatient(patientId, loginUser);
  }

  @Put(':patientId')
  @Roles('doctor')
  async updatePatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Body() patientData: PatientUpdateDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.updatePatient(patientId, patientData, loginUser);
  }

  @Delete(':patientId')
  @Roles('doctor')
  async deletePatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.deletePatient(patientId, loginUser);
  }

  @Patch('inactive/:patientId')
  @Roles('doctor')
  async inactivePatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.patientsService.inactivePatient(patientId, loginUser);
  }
}
