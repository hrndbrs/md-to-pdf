export type AppErrorCode =
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "IO_ERROR"
  | "PRINT_FAILED"
  | "INVALID_PATH"
  | "UNKNOWN";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
