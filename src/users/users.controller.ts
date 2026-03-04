import {
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AccessTokenPayloadDto, SearchUsersQueryDto } from '../dto/auth.dto';
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
  @ApiOperation({ summary: 'Search users by role and/or email with pagination' })
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

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return this.usersService.updateProfile(loginUser);
  }
}
