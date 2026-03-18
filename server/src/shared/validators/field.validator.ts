export class FieldValidator {
  private errors: string[] = [];

  validate(fn: () => string | null): FieldValidator {
    const error = fn();
    if (error) this.errors.push(error);
    return this;
  }

  getErrors(): string[] {
    return this.errors;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }
}
