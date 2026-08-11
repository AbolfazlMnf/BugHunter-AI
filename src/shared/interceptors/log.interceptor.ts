import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AppService } from 'src/app.service';
import { LogType } from '../schemas/log.schema';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly appService: AppService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        if (request.method !== `GET`) {
          void this.appService.addLog({
            type: LogType[request.method as keyof typeof LogType],
            url: request.url,
            content: JSON.stringify(request.body),
          });
        }
      }),
    );
  }
}
