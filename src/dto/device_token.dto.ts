import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeviceCreateDto {
  @ApiProperty()
  @IsNumber()
  patientId: number;

  @ApiProperty()
  @IsNumber()
  appointmentId: number;
}
