import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class MessageCreateDto {
  @ApiProperty()
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  message: string;
}
