import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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
import { OTP_TYPE, OTP_KEYS } from 'src/constants';
import { randomUUID } from 'node:crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsersService } from 'src/users/users.service';
import { PatientsService } from 'src/patients/patients.service';
import { EMAIL_TEMPLATE, getEmailTemplate } from 'src/templates';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly doctorService: UsersService,
    private readonly patientService: PatientsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
      // check whether doctor exists or not
      const existing = await this.doctorRepository.findOne({
        where: { email: doctor.email },
        select: ['id'],
      });

      if (existing) {
        throw new ConflictException('account already exists');
      }
      // store temp data
      const entityId = randomUUID();
      const tempKey = OTP_KEYS.tempDataKey(OTP_TYPE.SIGNUP_DOCTOR, entityId);

      await this.cacheManager.set(tempKey, doctor);

      // send otp
      await this.otpService.sendOtp(
        doctor.email,
        OTP_TYPE.SIGNUP_DOCTOR,
        entityId,
      );

      return new ApiResponseDto('otp send successfully', { entityId });
    } catch (error) {
      throw new HttpException(
        'failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signupPatient(patient: PatientSignupDto): Promise<ApiResponseDto> {
    try {
      // check whether patient exists or not
      const existing = await this.patientRepository.findOne({
        where: { email: patient.email },
        select: ['id'],
      });

      if (existing) {
        throw new ConflictException('account already exists');
      }
      // store temp data
      const entityId = randomUUID();
      const tempKey = OTP_KEYS.tempDataKey(OTP_TYPE.SIGNUP_PATIENT, entityId);

      await this.cacheManager.set(tempKey, patient);

      // send otp
      await this.otpService.sendOtp(
        patient.email,
        OTP_TYPE.SIGNUP_PATIENT,
        entityId,
      );

      return new ApiResponseDto('otp send successfully', { entityId });
    } catch (error) {
      throw new HttpException(
        'failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signupConfirm(verifyToken: string) {
    const tokenKey = OTP_KEYS.verifyTokenKey(verifyToken);

    const verifyData:
      | { to: string; type: OTP_TYPE; entityId: string }
      | undefined = await this.cacheManager.get(tokenKey);

    if (!verifyData) {
      throw new BadRequestException('Retry Signup');
    }

    const tempDataKey = OTP_KEYS.tempDataKey(
      verifyData.type,
      verifyData.entityId,
    );

    // find tempdata
    const data: DoctorSignupDto | PatientSignupDto | undefined =
      await this.cacheManager.get(tempDataKey);

    if (!data) {
      return new ApiResponseDto('retry resgistration');
    }

    switch (verifyData.type) {
      case OTP_TYPE.SIGNUP_DOCTOR:
        await this.doctorService.registerDoctor(data as DoctorSignupDto);
        emailUtility
          .send(
            data.email,
            'Welcome to CareConnect!',
            getEmailTemplate(EMAIL_TEMPLATE.WELCOME, {
              name: data.name,
              role: 'patient',
            }),
          )
          .then(() => console.log(`welcome email sent to ${data.email}`))
          .catch((err) =>
            console.log(
              `failed to send welcome email to ${data.email}. Error: ${err}`,
            ),
          );
        return new ApiResponseDto('account created successfully.');
      case OTP_TYPE.SIGNUP_PATIENT:
        await this.patientService.registerPatient(data as PatientSignupDto);
        emailUtility
          .send(
            data.email,
            'Welcome to CareConnect!',
            getEmailTemplate(EMAIL_TEMPLATE.WELCOME, {
              name: data.name,
              role: 'patient',
            }),
          )
          .then(() => console.log(`welcome email sent to ${data.email}`))
          .catch((err) =>
            console.log(
              `failed to send welcome email to ${data.email}. Error: ${err}`,
            ),
          );
        return new ApiResponseDto('account created successfully.');
      default:
        throw new BadRequestException();
    }
  }

  async logout(): Promise<ApiResponseDto> {
    return new ApiResponseDto('logged out', {
      token: 'invalid',
      type: 'Bearer',
    });
  }
}
