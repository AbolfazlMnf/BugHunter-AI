import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class EnglishPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const english = /^[A-Za-z]+$/;
    const items = [`lastName`, `firstName`];
    if (typeof value === `object`) {
      for (const key in value) {
        if (items.includes(key)) {
          const isEnglish = english.test(value[key]);
          if (!isEnglish) {
            throw new BadRequestException(`${key} must have English letter`);
          }
        }
      }
    }
    return value;
  }
}
