import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, DoctorSignupDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto): Promise<ApiResponseDto> {
    return this.authService.login(body);
  }

  @Post('signup')
  async signup(@Body() body: DoctorSignupDto): Promise<ApiResponseDto> {
    return this.authService.signup(body);
  }

  @Post('logout')
  async logout(): Promise<ApiResponseDto> {
    return this.authService.logout();
  }
}
