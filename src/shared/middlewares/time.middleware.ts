import { Injectable, NestMiddleware } from '@nestjs/common';
import { time, timeEnd } from 'console';

@Injectable()
export class TimeMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = Date.now();
    res.on(`finish`, () => {
      console.log(`time ${Date.now() - start}ms `);
    });

    next();
  }
}
