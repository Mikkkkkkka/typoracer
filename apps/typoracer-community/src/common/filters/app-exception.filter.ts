import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isApiRequest = request.path.startsWith('/api');
    const { status, message } = this.mapException(exception);

    if (isApiRequest) {
      response.status(status).json({
        statusCode: status,
        message,
        path: request.path,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (status === HttpStatus.NOT_FOUND) {
      response.status(status).render('not-found', {
        currentPath: '',
        title: 'Page Not Found',
      });
      return;
    }

    response.status(status).send(message);
  }

  private mapException(exception: unknown): {
    status: HttpStatus;
    message: string;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'object' &&
        response !== null &&
        'message' in response
          ? Array.isArray(response.message)
            ? response.message.join(', ')
            : String(response.message)
          : exception.message;

      return {
        status: exception.getStatus(),
        message,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found.',
        };
      }

      if (exception.code === 'P2002') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource conflict.',
        };
      }

      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Database request failed.',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error.',
    };
  }
}
