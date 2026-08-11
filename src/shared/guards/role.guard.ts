import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from 'src/user/Schema/user.schema';
import { IUserPayload } from '../types/auth';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly roles: Role[]) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: IUserPayload }>();
    const role = request.user.role;
    console.log(request.user);

    if (!this.roles.includes(role)) {
      return false;
    }
    return true;
  }
}
