/**
 * Result class for functional error handling
 * Represents either success or failure
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly success: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value, undefined as never);
  }

  static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined as never, error);
  }

  isOk(): boolean {
    return this.success;
  }

  isErr(): boolean {
    return !this.success;
  }

  getValue(): T {
    if (!this.success) {
      throw new Error('Cannot get value from error result');
    }

    return this.value!;
  }

  getError(): E {
    if (this.success) {
      throw new Error('Cannot get error from success result');
    }

    return this.error!;
  }

  /**
   * If this result is an error, send the error response and return true.
   * Returns false if the result is ok (no response sent).
   */
  sendIfErr(res: {
    status(code: number): { json(body: unknown): void };
  }): boolean {
    if (!this.success) {
      const error = this.error as unknown as {
        statusCode: number;
        toJSON(): unknown;
      };
      res.status(error.statusCode).json(error.toJSON());

      return true;
    }

    return false;
  }
}
