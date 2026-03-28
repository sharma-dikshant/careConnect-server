import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CreditsService } from 'src/credits/credits.service';

@Injectable()
export class CreditGuard implements CanActivate {
  constructor(private creditsService: CreditsService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // const requiredCredits = this.reflector.get<number>(
    //   'credits',
    //   context.getHandler(),
    // );

    // if (!requiredCredits) return true;

    // const hasCredits = await this.creditsService.hasEnoughCredits(
    //   user.id,
    //   requiredCredits,
    // );

    // if (!hasCredits) {
    //   throw new ForbiddenException('Not enough credits');
    // }

    return true;
  }
}
