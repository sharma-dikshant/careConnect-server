import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, DoctorSignupDto, PatientSignupDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<ApiResponseDto> {
    return this.authService.login(body);
  }

  @Post('signup/doctor')
  async signupDoctor(@Body() body: DoctorSignupDto): Promise<ApiResponseDto> {
    return this.authService.signupDoctor(body);
  }

  @Post('signup/patient')
  async signupPatient(@Body() body: PatientSignupDto): Promise<ApiResponseDto> {
    return this.authService.signupPatient(body);
  }

  @Post('signup/confirm')
  async signupConfirm(@Headers('x-verify-token') verifyToken: string) {
    if (!verifyToken) {
      throw new BadRequestException('missing or invalid headers');
    }
    return this.authService.signupConfirm(verifyToken);
  }

  @Post('logout')
  async logout(): Promise<ApiResponseDto> {
    return this.authService.logout();
  }
}
