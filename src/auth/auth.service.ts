import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import {
  LoginDto,
  DoctorSignupDto,
  AccessTokenPayloadDto,
} from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { hashPassword, verifyPassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private jwtService: JwtService,
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

  async signup(doctor: DoctorSignupDto): Promise<ApiResponseDto> {
    const existing = await this.doctorRepository.findOne({
      where: [{email: doctor.email}, {phone: doctor.phone}],
    });

    if (existing) {
      throw new HttpException(
        'user with this email or phone already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const hashedPassword = await hashPassword(doctor.password);
      const newDoctor = this.doctorRepository.create({
        ...doctor,
        password: hashedPassword,
      });

      await this.doctorRepository.save(newDoctor);

      const payload: AccessTokenPayloadDto = {
        id: newDoctor.id,
        role: 'doctor',
        name: newDoctor.name,
        email: newDoctor.email,
      };

      const token = this.jwtService.sign(payload);
      return new ApiResponseDto('signed up', { token, type: 'Bearer' });
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
