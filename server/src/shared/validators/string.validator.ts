export class StringValidator {
  static isRequired(value: unknown, field: string): string | null {
    if (value === undefined || value === null || value === '') {
      return `${field} is required`;
    }

    return null;
  }

  static isString(value: unknown, field: string): string | null {
    if (typeof value !== 'string') {
      return `${field} must be a string`;
    }

    return null;
  }

  static isEnum(
    value: unknown,
    allowed: string[],
    field: string
  ): string | null {
    if (typeof value !== 'string' || !allowed.includes(value)) {
      return `${field} must be one of: ${allowed.join(', ')}`;
    }

    return null;
  }
}
