import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { map, tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';

type ViewModel = Record<string, unknown>;
type RenderCallback = (error: Error, html: string) => void;

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now();
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'graphql') {
      return next.handle().pipe(
        tap({
          next: () => {
            const elapsedMs = performance.now() - startedAt;
            const gqlContext = GqlExecutionContext.create(context).getContext<{
              req?: Request;
              res?: Response;
            }>();
            const response = gqlContext.res ?? gqlContext.req?.res;
            const request = gqlContext.req;

            if (response && !response.headersSent) {
              response.setHeader('X-Elapsed-Time', `${elapsedMs.toFixed(2)}ms`);
            }

            if (request) {
              this.logger.log(
                `${request.method} ${this.getRequestPath(request)} completed in ${elapsedMs.toFixed(2)}ms`,
              );
            }
          },
        }),
      );
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const originalRender = response.render.bind(response) as Response['render'];

    response.render = (
      view: string,
      options?: object | RenderCallback,
      callback?: RenderCallback,
    ): void => {
      const elapsedMs = performance.now() - startedAt;

      if (typeof options === 'function') {
        response.locals.serverElapsedTime = `${elapsedMs.toFixed(2)} ms`;
        originalRender(view, options);
        return;
      }

      const nextOptions = {
        ...((options as ViewModel | undefined) ?? {}),
        serverElapsedTime: `${elapsedMs.toFixed(2)} ms`,
      };

      originalRender(view, nextOptions as object, callback);
    };

    return next.handle().pipe(
      map<unknown, unknown>((data: unknown) => {
        const elapsedMs = performance.now() - startedAt;

        if (this.shouldSetElapsedHeader(request) && !response.headersSent) {
          response.setHeader('X-Elapsed-Time', `${elapsedMs.toFixed(2)}ms`);
        }

        if (
          this.shouldAugmentRenderedModel(request) &&
          this.isViewModel(data)
        ) {
          return {
            ...data,
            serverElapsedTime: `${elapsedMs.toFixed(2)} ms`,
          };
        }

        return data;
      }),
      tap({
        next: () => {
          const elapsedMs = performance.now() - startedAt;
          this.logger.log(
            `${request.method} ${this.getRequestPath(request)} completed in ${elapsedMs.toFixed(2)}ms`,
          );
        },
      }),
    );
  }

  private shouldSetElapsedHeader(request: Request) {
    const path = this.getRequestPath(request);
    return (
      path.startsWith('/api') || path.startsWith('/graphql')
    );
  }

  private shouldAugmentRenderedModel(request: Request) {
    const path = this.getRequestPath(request);
    return (
      !path.startsWith('/api') && !path.startsWith('/graphql')
    );
  }

  private isViewModel(value: unknown): value is ViewModel {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getRequestPath(request: Request | undefined) {
    return request?.path ?? request?.url ?? '';
  }
}
