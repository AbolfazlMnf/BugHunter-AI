import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { changePasswordDto } from 'src/user/dtos/change-password.dto';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class ChangePasswordPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}
  async transform(value: changePasswordDto, metadata: ArgumentMetadata) {
    const { id, newPassword, oldPassword } = value;
    const pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/;

    const isValidNewPassword = pass.test(newPassword);
    const isValidOldPassword = pass.test(oldPassword);
    if (!isValidNewPassword || !isValidOldPassword) {
      throw new BadRequestException(`the type of password is not correct`);
    }
    const user = await this.userService.findOne(id);

    const isMatchOldPassword = await compare(oldPassword, user.password);
    if (!isMatchOldPassword) {
      throw new BadRequestException(`the old password is not matched`);
    }
    const salt = await genSalt();
    const hashedPassword = await hash(newPassword, salt);

    return { id, oldPassword, newPassword: hashedPassword };
  }
}
