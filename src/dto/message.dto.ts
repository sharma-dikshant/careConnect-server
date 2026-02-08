import { IsString } from 'class-validator';

export class MessageCreateDto {
  @IsString()
  message: string;
}
