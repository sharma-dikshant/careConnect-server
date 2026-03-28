import { SetMetadata } from '@nestjs/common';

export const RequiredCredits = (credits: number) =>
  SetMetadata('credits', credits);
