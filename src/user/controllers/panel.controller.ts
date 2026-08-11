import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { changePasswordDto } from '../dtos/change-password.dto';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { ChangePasswordPipe } from 'src/shared/pipes/change-password.pipe';
import { BodyIdPipe } from 'src/shared/pipes/body-id.pipe';

@ApiTags(`Panel`)
@ApiBearerAuth()
@Controller('panel')
@UseGuards(JwtGuard)
export class PanelController {
  constructor(private readonly userService: UserService) {}

  @Put(`change-password`)
  async changePassword(
    @Body(ChangePasswordPipe, new BodyIdPipe([`id`])) body: changePasswordDto,
  ) {
    const { newPassword, oldPassword, id } = body;
    const user = await this.userService.updateUser(id, {
      password: newPassword,
    });
    return user;
  }
  @Get(`user/:id`)
  getOne(@Param(`id`) id: string) {
    return this.userService.findOne(id);
  }
}
