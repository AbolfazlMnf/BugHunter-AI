import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { convertToEnglishNumber } from '../utils/number';

@Injectable()
export class MobilePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value?.mobile && typeof value === `object`) {
      const phoneNumber = /^09\d{9}$/;
      const englishMobile = convertToEnglishNumber(value.mobile);
      const isValidMobile = phoneNumber.test(englishMobile);
      if (!isValidMobile) {
        throw new BadRequestException(`format of phone number is not valid !`);
      }
      return { ...value, mobile: englishMobile };
    }
    return value;
  }
}
