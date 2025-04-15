/**
 * Defines the contract for a logging service.
 * Allows for different implementations (e.g., Console, File, API).
 */
export interface ILogger {
  log(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: any[]): void;
  debug?(message: string, ...optionalParams: any[]): void; // Optional debug method
}
