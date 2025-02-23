import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get("user-agent") || "";
    const requestId = uuidv4();
    const startTime = Date.now();

    // Add request ID to the request object for tracking
    request["requestId"] = requestId;

    // Log the incoming request
    this.logger.log(
      `[${requestId}] Incoming ${method} ${originalUrl} from ${ip} using ${userAgent}`
    );

    // Log request body in development
    if (process.env.NODE_ENV !== "production" && request.body) {
      const sanitizedBody = this.sanitizeBody(request.body);
      this.logger.debug(
        `[${requestId}] Request body: ${JSON.stringify(sanitizedBody)}`
      );
    }

    // Add response logging
    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");
      const duration = Date.now() - startTime;

      const level =
        statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "log";
      const message = `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}B - ${duration}ms`;

      this.logger[level](message);

      // Log detailed error information in development
      if (statusCode >= 400 && process.env.NODE_ENV !== "production") {
        const responseBody = (response as any)._responseBody; // Access response body if available
        if (responseBody) {
          this.logger.debug(
            `[${requestId}] Response body: ${JSON.stringify(responseBody)}`
          );
        }
      }
    });

    // Error handling
    response.on("error", (error) => {
      this.logger.error(
        `[${requestId}] Error processing ${method} ${originalUrl}: ${error.message}`,
        error.stack
      );
    });

    // Continue to next middleware/handler
    next();
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ["password", "token", "authorization", "secret"];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "***";
      }
    }

    return sanitized;
  }
}

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
