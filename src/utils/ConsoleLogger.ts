import { ILogger } from './logger.interface';

/**
 * A simple logger implementation that outputs to the console.
 */
export class ConsoleLogger implements ILogger {
  log(message: string, ...optionalParams: any[]): void {
    console.log(`[LOG] ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }

  // Example of implementing the optional debug method
  debug(message: string, ...optionalParams: any[]): void {
    // You might enable/disable this based on an environment variable
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  }
}
