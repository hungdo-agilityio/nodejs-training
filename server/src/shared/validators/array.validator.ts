export class ArrayValidator {
  static isArray(value: unknown, field: string): string | null {
    if (!Array.isArray(value)) {
      return `${field} must be an array`;
    }

    return null;
  }

  static isNonEmpty(value: unknown, field: string): string | null {
    const arrayError = ArrayValidator.isArray(value, field);

    if (arrayError) return arrayError;

    if ((value as unknown[]).length === 0) {
      return `${field} must not be empty`;
    }

    return null;
  }
}
