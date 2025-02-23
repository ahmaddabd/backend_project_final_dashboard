import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get("NODE_ENV", "development");
    const logLevel = this.configService.get("LOG_LEVEL", "info");
    const logsDir = path.join(process.cwd(), "logs");

    // Ensure logs directory exists
    if (environment === "production" && !fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ];

    if (environment === "development") {
      formats.push(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, trace, ...meta }) => {
            return `${timestamp} [${level}] ${
              context ? `[${context}] ` : ""
            }${message}${trace ? `\n${trace}` : ""}${
              Object.keys(meta).length
                ? `\n${JSON.stringify(meta, null, 2)}`
                : ""
            }`;
          }
        )
      );
    }

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: logLevel,
      }),
    ];

    if (environment === "production") {
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, "error.log"),
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, "combined.log"),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(...formats),
      transports,
    });
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  logWithMetadata(
    level: string,
    message: string,
    metadata: Record<string, any>
  ) {
    this.logger.log(level, message, {
      ...metadata,
      context: this.context,
    });
  }

  startTimer() {
    const start = process.hrtime();
    return {
      end: (operation: string) => {
        const diff = process.hrtime(start);
        const duration = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
        this.debug(`${operation} completed in ${duration.toFixed(2)}ms`);
      },
    };
  }

  async logAsyncOperation<T>(
    operation: string,
    promise: Promise<T>
  ): Promise<T> {
    const timer = this.startTimer();
    try {
      const result = await promise;
      timer.end(operation);
      return result;
    } catch (error) {
      this.error(`${operation} failed`, error.stack);
      throw error;
    }
  }
}
