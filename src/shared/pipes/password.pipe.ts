import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class PasswordPipe implements PipeTransform {
  constructor(private readonly isNew: boolean) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    const pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/;
    if (value?.password && typeof value === `object`) {
      const isPasswordValid = pass.test(value?.password);
      if (!isPasswordValid) {
        throw new BadRequestException(
          'Password must be at least 8 characters and contain at least one letter and one number.',
        );
      }
      if (this.isNew) {
        const salt = await genSalt();
        const hashedPassword = await hash(value?.password, salt);
        return { ...value, password: hashedPassword };
      } else {
        return value;
      }
    }
    return value;
  }
}
