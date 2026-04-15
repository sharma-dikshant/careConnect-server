import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return this.trim(value);
  }

  private trim(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (value !== null && typeof value === 'object') {
      const trimmed = {};
      for (const key in value) {
        trimmed[key] = this.trim(value[key]);
      }
      return trimmed;
    }

    return value;
  }
}
