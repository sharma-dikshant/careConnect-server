import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CareProtocolsService } from './care_protocols.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/care-protocols')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CareProtocolsController {
  constructor(private readonly careProtocolsService: CareProtocolsService) {}

  // POST ROUTES
  @Roles('doctor')
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async addCareProtocol(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.careProtocolsService.addCareProtocol(file, loginUser);
  }

  @Roles('doctor', 'patient')
  @Post('locals/:appointmentId')
  @UseInterceptors(FileInterceptor('file'))
  async addAppointmentCareProtocol(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.careProtocolsService.addAppointmentCareProtocol(
      appointmentId,
      file,
      loginUser,
    );
  }

  // GET ROUTES
  @Roles('doctor')
  @Get('')
  async getAllCareProtocolsByDoctorId(
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ) {
    return this.careProtocolsService.getAllCareProtocolsByDoctorId(
      loginUser.id,
    );
  }

  @Roles('doctor', 'patient')
  @Get('appointments/:appointmentId')
  @ApiOperation({
    summary: 'Get all care protocols for an appointment',
    description:
      `Returns both appointment-scoped protocols and all active global protocols of the appointment's doctor. Accessible by the appointment's doctor or patient.`,
  })
  async getAppointmentCareProtocols(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.careProtocolsService.getAppointmentCareProtocols(
      appointmentId,
      loginUser,
    );
  }

  @Roles('doctor', 'patient')
  @Get(':id/download')
  @ApiOperation({
    summary: 'Get a presigned S3 download URL for a care protocol file',
    description:
      'Pass type=global for global care protocols (doctor only) or type=appointment for appointment-scoped protocols (doctor or patient on that appointment).',
  })
  @ApiQuery({
    name: 'type',
    enum: ['global', 'appointment'],
    required: true,
    description: 'The type of care protocol to download',
  })
  async downloadCareProtocol(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type: string,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    if (!type || !['global', 'appointment'].includes(type)) {
      throw new BadRequestException(
        'Query param "type" is required and must be "global" or "appointment"',
      );
    }
    return this.careProtocolsService.downloadCareProtocol(id, type, loginUser);
  }

  // DELETE ROUTE
  @Roles('doctor')
  @Delete('appointments/:contextId')
  async removeCareProtocol(
    @Param('contextId', ParseIntPipe) contextId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.careProtocolsService.removeCareProtocol(contextId, loginUser);
  }

  @Roles('doctor')
  @Delete('appointments/:contextId')
  async removeAppointmentCareProtocol(
    @Param('contextId', ParseIntPipe) contextId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.careProtocolsService.removeAppointmentCareProtocol(
      contextId,
      loginUser,
    );
  }
}
