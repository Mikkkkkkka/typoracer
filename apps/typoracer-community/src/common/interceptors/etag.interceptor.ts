import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    if (request.method !== 'GET' || !request.path.startsWith('/api/')) {
      return next.handle();
    }

    return next.handle().pipe(
      map<unknown, unknown>((data: unknown) => {
        if (data === undefined || response.headersSent) {
          return data;
        }

        const payload = JSON.stringify(data);
        const etag = `"${createHash('sha1').update(payload).digest('base64url')}"`;

        response.setHeader('ETag', etag);

        if (request.headers['if-none-match'] === etag) {
          response.status(304);
          return undefined;
        }

        return data;
      }),
    );
  }
}
