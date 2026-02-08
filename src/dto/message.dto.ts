import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageCreateDto {
  @ApiProperty()
  @IsString()
  message: string;
}
