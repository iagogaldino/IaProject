import { Config } from '../config/config';

/**
 * Serviço de logging simples para o backend principal
 */
export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, metadata?: Record<string, any>): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, metadata ? JSON.stringify(metadata) : '');
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, metadata ? JSON.stringify(metadata) : '');
  }

  public error(message: string, error?: Error, metadata?: Record<string, any>): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.stack,
      ...metadata
    });
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    if (Config.isDevelopment()) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, metadata ? JSON.stringify(metadata) : '');
    }
  }
}

export const logger = Logger.getInstance();
