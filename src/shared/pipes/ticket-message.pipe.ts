import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class TicketMessagePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value?.content && !value?.image) {
      throw new BadRequestException(`one of image or content is required`);
    }
    return value;
  }
}
