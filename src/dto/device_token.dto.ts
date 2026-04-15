import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeviceCreateDto {
  @ApiProperty()
  @IsInt({ message: 'Appointment ID must be a whole number' })
  @Min(1, { message: 'Appointment ID must be a positive number' })
  appointmentId: number;
}
