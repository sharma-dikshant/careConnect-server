import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PatientCreateDto, PatientUpdateDto } from '../dto/patient.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginationDto } from '../dto/pagination.dto';

@Controller('api/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}


  // @Get('all')
  // @Roles('doctor')
  // @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  // @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  // async getAllPatients(
  //   @Query() pagination: PaginationDto,
  //   @CurrentUser() loginUser: AccessTokenPayloadDto,
  // ): Promise<ApiResponseDto> {
  //   return this.patientsService.getAllPatients(loginUser, pagination);
  // }

  // @Get(':patientId')
  // @Roles('doctor')
  // async getPatient(
  //   @Param('patientId', ParseIntPipe) patientId: number,
  //   @CurrentUser() loginUser: AccessTokenPayloadDto,
  // ): Promise<ApiResponseDto> {
  //   return this.patientsService.getPatient(patientId, loginUser);
  // }

  // @Put(':patientId')
  // @Roles('doctor')
  // async updatePatient(
  //   @Param('patientId', ParseIntPipe) patientId: number,
  //   @Body() patientData: PatientUpdateDto,
  //   @CurrentUser() loginUser: AccessTokenPayloadDto,
  // ): Promise<ApiResponseDto> {
  //   return this.patientsService.updatePatient(
  //     patientId,
  //     patientData,
  //     loginUser,
  //   );
  // }

  // @Delete(':patientId')
  // @Roles('doctor')
  // async deletePatient(
  //   @Param('patientId', ParseIntPipe) patientId: number,
  //   @CurrentUser() loginUser: AccessTokenPayloadDto,
  // ): Promise<ApiResponseDto> {
  //   return this.patientsService.deletePatient(patientId, loginUser);
  // }

  // @Patch('inactive/:patientId')
  // @Roles('doctor')
  // async inactivePatient(
  //   @Param('patientId', ParseIntPipe) patientId: number,
  //   @CurrentUser() loginUser: AccessTokenPayloadDto,
  // ): Promise<ApiResponseDto> {
  //   return this.patientsService.inactivePatient(patientId, loginUser);
  // }
}
