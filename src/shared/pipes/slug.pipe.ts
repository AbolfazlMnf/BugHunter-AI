import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class slugPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === `object` && value?.url) {
      const url = /^[a-zA-Z0-9-]+$/;
      const newUrl = value.url.toLowerCase();
      const isValidUrl = url.test(newUrl);
      if (!isValidUrl) {
        throw new BadRequestException(`url format is not correct`);
      }
      value.url = newUrl;
      return value;
    }
    return value;
  }
}
