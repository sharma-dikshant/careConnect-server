import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { DeviceCreateDto } from 'src/dto/device_token.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AccessTokenPayloadDto } from 'src/dto/auth.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @Roles('doctor')
  create(
    @Body() createDeviceDto: DeviceCreateDto,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ) {
    return this.devicesService.create(loginUser.id, createDeviceDto);
  }

  @Get()
  @Roles('doctor')
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @Roles('doctor')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Get('/appointments/:appointmentId')
  @Roles('doctor')
  findAllAppointmentDeviceToken(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ) {
    return this.devicesService.findAllAppointmentDevices(
      loginUser.id,
      appointmentId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
