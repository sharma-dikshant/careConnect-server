import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
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

  @Get(':id')
  async getCareProtocolById(@Param('id', ParseIntPipe) id: number) {}

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
