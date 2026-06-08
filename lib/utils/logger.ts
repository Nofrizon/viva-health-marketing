// lib/utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logColors = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[35m',   // Magenta
  reset: '\x1b[0m'
};

export class Logger {
  constructor(private prefix: string) {}

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const color = logColors[level];
    return `${color}[${timestamp}] [${this.prefix}] [${level.toUpperCase()}]${logColors.reset} ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  error(message: string, error?: Error | unknown): void {
    const errorDetails = error instanceof Error ? `: ${error.message}` : '';
    console.error(this.formatMessage('error', message + errorDetails));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message), data || '');
    }
  }
}

export const auditLogger = new Logger('Audit');
