import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { AuthDto } from 'src/user/dtos/auth.dto';
import { User } from 'src/user/Schema/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}
  async signIn(body: AuthDto) {
    const user = await this.findUserByEmail(body.email);
    const isMatchPassword = await compare(body.password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestException(`the password is not correct`);
    } else {
      const payload = { _id: user._id, role: user.role };
      const token = this.jwtService.sign(payload);
      return { token };
    }
  }
  async findUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
