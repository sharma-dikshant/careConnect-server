import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  AccessTokenPayloadDto,
  SearchUsersQueryDto,
  UpdateDoctorProfileDto,
  UpdatePatientProfileDto,
} from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.getProfile(loginUser);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search users by role and/or email with pagination',
  })
  @ApiQuery({ name: 'role', required: false, enum: ['doctor', 'patient'] })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.searchUsers(query);
  }

  @Get('doctors/:doctorId')
  @ApiOperation({ summary: 'Get a doctor profile by ID' })
  async getDoctor(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.getDoctor(doctorId, loginUser);
  }

  @Get('patients/:patientId')
  @ApiOperation({ summary: 'Get a patient profile by ID' })
  async getPatient(
    @Param('patientId', ParseIntPipe) patientId: number,
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.getPatient(patientId, loginUser);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    description:
      'Fields to update. Doctors can update all doctor-specific fields; patients can only update name.',
    schema: {
      oneOf: [
        {
          title: 'UpdateDoctorProfileDto',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            designation: { type: 'string' },
            license: { type: 'string' },
            specialization: { type: 'string' },
            experience: { type: 'integer' },
            bio: { type: 'string' },
            hospital: { type: 'string' },
          },
        },
        {
          title: 'UpdatePatientProfileDto',
          properties: {
            name: { type: 'string' },
          },
        },
      ],
    },
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateProfile(
    @CurrentUser() loginUser: AccessTokenPayloadDto,
    @Body() updateDto: UpdateDoctorProfileDto | UpdatePatientProfileDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.updateProfile(loginUser, updateDto);
  }
}
