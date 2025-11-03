
import type {  Request, Response } from "express"
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let stack: string | undefined;

    // ✅ Handle NestJS HttpException
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
      stack =
        process.env.MOOD === 'development'
          ? exception.stack
          : undefined;
    }

    // ✅ Handle Mongo duplicate key error
    else if (exception?.code === 11000 && exception?.keyValue) {
      statusCode = HttpStatus.CONFLICT;
      const key = Object.keys(exception.keyValue)[0];
      const value = exception.keyValue[key];
      message = `Duplicated ${key} value: "${value}"`;
      stack =
        process.env.MOOD === 'development'
          ? exception.stack
          : undefined;
    }

    // ✅ Handle generic JS errors
    else if (exception instanceof Error) {
      message = exception.message;
      stack =
        process.env.MOOD === 'development'
          ? exception.stack
          : undefined;
    }

    response.status(statusCode).json({
      status: statusCode,
      message,
      path: request.url,
    //  timestamp: new Date().toISOString(),
      ...(stack && { stack }), // ✅ Include stack only if it exists
    });
  }
}