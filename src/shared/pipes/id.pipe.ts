import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class IdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === `param` && metadata.data === `id`) {
      if (!isValidObjectId(value)) {
        throw new BadRequestException(`type of id is not Valid !`);
      } else {
        return value;
      }
    }
    return value;
  }
}
