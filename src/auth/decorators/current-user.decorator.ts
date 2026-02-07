import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayloadDto } from '../../dto/auth.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AccessTokenPayloadDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
