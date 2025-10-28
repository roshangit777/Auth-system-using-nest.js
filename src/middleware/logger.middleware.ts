import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    this.logger.log(
      `[Incoming -> ${method} ${originalUrl} - ${ip} - ${userAgent}]`,
    );

    req['startTime'] = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - req['startTime'];

      const { statusCode } = res;

      if (statusCode >= 500) {
        this.logger.error(
          `[Response -> ${method} ${originalUrl} - ${statusCode} - ${duration}ms]`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `[Response -> ${method} ${originalUrl} - ${statusCode} - ${duration}ms]`,
        );
      } else {
        this.logger.log(
          `[Response -> ${method} ${originalUrl} - ${statusCode} - ${duration}ms]`,
        );
      }
    });

    // call the next middleware in the chain

    next();
  }
}
