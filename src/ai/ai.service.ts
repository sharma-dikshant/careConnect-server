import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreditsService } from 'src/credits/credits.service';
import { ApiResponseDto } from 'src/dto/api-response.dto';
import { AccessTokenPayloadDto } from 'src/dto/auth.dto';

@Injectable()
export class AiService {
  constructor(private readonly creditService: CreditsService) {}
  async generatePatientGuide(prompt: string, user: AccessTokenPayloadDto) {
    try {
      await this.creditService.debitUserCredits(user.id, 5);
      return new ApiResponseDto('patient guide generated successfully.', {
        guide: 'this is the dummy guide',
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'failed to generate patient GUide',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
