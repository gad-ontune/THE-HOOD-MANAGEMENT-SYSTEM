import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: isProduction
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const ctx = context ? `[${context}]` : '';
              const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
            }),
          ),
      transports: [
        new winston.transports.Console(),
        ...(isProduction
          ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
             new winston.transports.File({ filename: 'logs/combined.log' })]
          : []),
      ],
    });
  }

  log(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>) {
    this.logger.verbose(message, { context, ...meta });
  }
}
