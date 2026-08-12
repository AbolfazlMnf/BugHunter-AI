import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sort, sortOrder } from 'src/shared/dtos/query.dto';
import { getOrderOption } from 'src/shared/utils/order';
import { getSortOption } from 'src/shared/utils/sort';
import { UpdateUserDto, UserDto } from 'src/user/dtos/User.dto';
import { UserQueryDto } from 'src/user/dtos/user.query.dto';
import { Role, User } from 'src/user/Schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async getAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 5,
      lastName,
      email,
      sort = Sort.CreatedAt,
      order = sortOrder.Desc,
    } = query;
    const orderOption = getOrderOption(order);
    const sortOption = getSortOption(orderOption, sort);
    const filter = lastName
      ? { lastName: { $regex: lastName, $options: `i` } }
      : email
        ? { email: { $regex: email, $options: `i` } }
        : {};

    const [users, count] = await Promise.all([
      this.userModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sortOption)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { page, limit, users, count };
  }
  async create(body: UserDto) {
    const newUser = new this.userModel(body);
    newUser.role = Role.User;
    await newUser.save();
    return newUser;
  }
  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
  async updateUser(id: string, body: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, body, {
      returnDocument: `after`,
    });
    return user;
  }
  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException();
    }
    return { message: `user deleted successfully` };
  }
  async changeRole(userId: string, role: Role) {
    const user = await this.findOne(userId);
    user.role = role;
    await user.save();
    return {
      message: `role changed`,
      user,
    };
  }
}
