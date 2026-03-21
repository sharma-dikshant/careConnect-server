import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import {
  LoginDto,
  DoctorSignupDto,
  PatientSignupDto,
  AccessTokenPayloadDto,
} from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { verifyPassword } from '../utils/password.util';
import { OtpService } from 'src/otp/otp.service';
import emailUtility from 'src/utils/email.util';
import { OTP_TYPE } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async login(data: LoginDto): Promise<ApiResponseDto> {
    if (data.type === 'doctor') {
      return this.loginDoctor(data.email, data.password);
    } else if (data.type === 'patient') {
      return this.loginPatient(data.email, data.password);
    }

    throw new HttpException('Invalid login type', HttpStatus.BAD_REQUEST);
  }

  private async loginDoctor(
    email: string,
    password: string,
  ): Promise<ApiResponseDto> {
    const existing = await this.doctorRepository.findOne({ where: { email } });

    if (!existing) {
      throw new HttpException(
        'No doctor exist with given email id',
        HttpStatus.FORBIDDEN,
      );
    }

    const isPasswordValid = await verifyPassword(password, existing.password);
    if (!isPasswordValid) {
      throw new HttpException('incorrect password', HttpStatus.BAD_REQUEST);
    }

    const payload: AccessTokenPayloadDto = {
      id: existing.id,
      role: 'doctor',
      name: existing.name,
      email: existing.email,
    };

    const token = this.jwtService.sign(payload);
    return new ApiResponseDto('logged in', { token, type: 'Bearer' });
  }

  private async loginPatient(
    email: string,
    password: string,
  ): Promise<ApiResponseDto> {
    const existing = await this.patientRepository.findOne({ where: { email } });

    if (!existing) {
      throw new HttpException(
        'No patient exist with given email id',
        HttpStatus.FORBIDDEN,
      );
    }

    const isPasswordValid = await verifyPassword(password, existing.password);
    if (!isPasswordValid) {
      throw new HttpException('incorrect password', HttpStatus.BAD_REQUEST);
    }

    const payload: AccessTokenPayloadDto = {
      id: existing.id,
      role: 'patient',
      name: existing.name,
      email: existing.email,
    };

    const token = this.jwtService.sign(payload);
    return new ApiResponseDto('logged in', { token, type: 'Bearer' });
  }

  async signupDoctor(doctor: DoctorSignupDto): Promise<ApiResponseDto> {
    try {
      // send otp
      await this.otpService.sendOtp(
        doctor.email,
        OTP_TYPE.SIGNUP_DOCTOR,
        doctor,
      );

      return new ApiResponseDto('otp send successfully');
    } catch (error) {
      throw new HttpException(
        'failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signupPatient(patient: PatientSignupDto): Promise<ApiResponseDto> {
    try {
      // send otp
      await this.otpService.sendOtp(
        patient.email,
        OTP_TYPE.SIGNUP_PATIENT,
        patient,
      );

      return new ApiResponseDto('otp send successfully');
    } catch (error) {
      throw new HttpException(
        'failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(): Promise<ApiResponseDto> {
    return new ApiResponseDto('logged out', {
      token: 'invalid',
      type: 'Bearer',
    });
  }
}
