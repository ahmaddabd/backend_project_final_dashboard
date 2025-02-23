import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { QueryFailedError } from "typeorm";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let error: string;
    let details: any = null;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === "string"
          ? response
          : (response as any).message || exception.message;
      error = exception.name;
      details = (response as any).error || null;
    } else if (exception instanceof QueryFailedError) {
      message = "Database operation failed";
      error = "QueryFailedError";
      if (process.env.NODE_ENV !== "production") {
        details = {
          query: exception.query,
          parameters: exception.parameters,
          driverError: exception.driverError,
        };
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      if (process.env.NODE_ENV !== "production") {
        details = exception.stack;
      }
    } else {
      message = "Internal server error";
      error = "InternalServerError";
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      error,
      message,
      ...(details && { details }),
    };

    // Log the error
    this.logger.error(
      `${error}: ${message}`,
      details ? JSON.stringify(details) : undefined,
      "AllExceptionsFilter"
    );

    // Send the response
    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  private sanitizeError(error: any): any {
    if (this.isProduction()) {
      // Remove sensitive information in production
      const { password, ...sanitized } = error;
      return sanitized;
    }
    return error;
  }
}
