import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayloadDto } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'my_secret_key',
    });
  }

  async validate(
    payload: AccessTokenPayloadDto,
  ): Promise<AccessTokenPayloadDto> {
    return {
      id: payload.id,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
  }
}
