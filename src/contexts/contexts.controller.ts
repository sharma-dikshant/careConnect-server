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
import { ContextsService } from './contexts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/contexts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('doctor')
export class ContextsController {
  constructor(private readonly contextsService: ContextsService) {}

  @Post('globals')
  @UseInterceptors(FileInterceptor('file'))
  async addGlobalContext(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.contextsService.addGlobalContext(file, loginUser);
  }

  @Get('globals')
  async getGlobalContexts(@CurrentUser() loginUser: AccessTokenPayloadDto) {
    return { data: `global contexts of :${loginUser.id}` };
  }

  @Post('locals/:appointmentId')
  @UseInterceptors(FileInterceptor('file'))
  async addPatientContext(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.contextsService.addPatientContext(appointmentId, file, loginUser);
  }

  @Get('locals/:appointmentId')
  async getLocalContexts(@Param('appointmentId', ParseIntPipe) appointmentId: number) {
    return { data: `local contexts of appointment id: ${appointmentId}` };
  }

  @Delete('globals/:contextId')
  async removeGlobalContext(
    @Param('contextId', ParseIntPipe) contextId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.contextsService.removeGlobalContext(contextId, loginUser);
  }

  @Delete('locals/:contextId')
  async removeLocalContext(
    @Param('contextId', ParseIntPipe) contextId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.contextsService.removeLocalContext(contextId, loginUser);
  }
}
