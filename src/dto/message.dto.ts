import { IsEnum, IsString } from 'class-validator';

export class MessageCreateDto {
  @IsEnum(['patient', 'bot'])
  sender: 'patient' | 'bot';

  @IsString()
  message: string;
}
