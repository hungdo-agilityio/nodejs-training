import { ApiError } from '@shared/errors';

export { FieldValidator } from './field.validator';
export { StringValidator } from './string.validator';
export { ArrayValidator } from './array.validator';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ApiError };
