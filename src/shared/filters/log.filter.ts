import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { LogType } from '../schemas/log.schema';
import { MongoServerError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly appService: AppService) {}
  async catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = {
      statusCode: status,
      message: `Internal server error`,
    };

    if (exception instanceof MongoServerError && exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      const item = Object.keys(exception.keyPattern)[0];
      body = {
        statusCode: status,
        message: `${item} is already exist `,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse();
    } else if (exception instanceof Error) {
      body = {
        statusCode: status,
        message: exception.message,
      };
    }

    try {
      await this.appService.addLog({
        type: LogType.Error,
        url: request.url,
        content: JSON.stringify(body),
      });
    } catch (err) {
      console.log(`LogError`, err);
    }

    response.status(status).send(body);
  }
}
