export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }

  static validationError(message: string): ApiError {
    return new ApiError('VALIDATION_ERROR', message, 400);
  }

  static notFound(message: string): ApiError {
    return new ApiError('NOT_FOUND', message, 404);
  }

  static conflict(message: string): ApiError {
    return new ApiError('CONFLICT', message, 409);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message: string): ApiError {
    return new ApiError('FORBIDDEN', message, 403);
  }

  static internalError(message: string): ApiError {
    return new ApiError('INTERNAL_ERROR', message, 500);
  }
}
