import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Schema/user.schema';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PanelController } from './controllers/panel.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController, AuthController, PanelController],
  providers: [UserService, AuthService],
})
export class UserModule {}
