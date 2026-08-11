import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserQueryDto } from '../dtos/user.query.dto';
import { UpdateUserDto } from '../dtos/User.dto';
import { EnglishPipe } from 'src/shared/pipes/english.pipe';
import { MobilePipe } from 'src/shared/pipes/mobile.pipe';
import { PasswordPipe } from 'src/shared/pipes/password.pipe';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Role } from '../Schema/user.schema';
import { RoleDto } from '../dtos/auth.dto';

@ApiTags(`Users`)
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(`Admin/all`)
  @UseGuards(new RoleGuard([Role.Admin]))
  findAll(@Query() queries: UserQueryDto) {
    return this.userService.getAll(queries);
  }
  @Get(`:id`)
  getOne(@Param(`id`) id: string) {
    return this.userService.findOne(id);
  }
  @Patch(`:id`)
  @ApiOperation({
    description: `update user info`,
  })
  update(
    @Param(`id`) id: string,
    @Body(EnglishPipe, MobilePipe, new PasswordPipe(true)) body: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, body);
  }
  @Delete(`:id/Admin`)
  @UseGuards(new RoleGuard([Role.Admin]))
  delete(@Param(`id`) id: string) {
    return this.userService.deleteUser(id);
  }
  @Put(`:id/role/Admin`)
  @UseGuards(new RoleGuard([Role.Admin]))
  changeRole(@Param(`id`) id: string, @Body() body: RoleDto) {
    return this.userService.changeRole(id, body.role);
  }
}
