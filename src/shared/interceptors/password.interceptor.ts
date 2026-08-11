import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class PasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const newResponse = JSON.parse(JSON.stringify(response));

        if (newResponse.password) {
          delete newResponse.password;
        }

        return newResponse;
      }),
    );
  }
}
