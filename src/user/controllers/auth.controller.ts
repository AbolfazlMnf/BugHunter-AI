import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UserDto } from '../dtos/User.dto';
import { EnglishPipe } from 'src/shared/pipes/english.pipe';
import { PasswordPipe } from 'src/shared/pipes/password.pipe';
import { MobilePipe } from 'src/shared/pipes/mobile.pipe';
import { AuthDto } from '../dtos/auth.dto';
import { PasswordInterceptor } from 'src/shared/interceptors/password.interceptor';

@ApiTags(`Authentication`)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Post(`sign-up`)
  @UseInterceptors(PasswordInterceptor)
  signUp(@Body(EnglishPipe, new PasswordPipe(true)) body: UserDto) {
    return this.userService.create(body);
  }
  @Post(`login`)
  login(@Body(MobilePipe, new PasswordPipe(false)) body: AuthDto) {
    return this.authService.signIn(body);
  }
}
