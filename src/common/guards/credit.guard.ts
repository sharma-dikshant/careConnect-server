import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreditsService } from 'src/credits/credits.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CreditGuard implements CanActivate {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredCredits = this.reflector.getAllAndOverride<number>(
      'credits',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredCredits) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const hasCredits = await this.creditsService.hasEnoughCredits(
      user.id,
      requiredCredits,
    );

    if (!hasCredits) {
      throw new ForbiddenException('Not enough credits');
    }

    return true;
  }
}
