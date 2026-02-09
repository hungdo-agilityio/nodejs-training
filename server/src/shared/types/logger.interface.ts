export interface ILogger {
  log(message: string): void;
  error(message: string, error?: Error): void;
  warn(message: string): void;
  info(message: string): void;
}
