import { ApiError } from '@shared/errors';
import {
  FieldValidator,
  StringValidator,
  ValidationResult,
} from '@shared/validators';

export class SlotValidator {
  static validateGetSlots(query: Record<string, unknown>): ValidationResult {
    const { date } = query;

    const validator = new FieldValidator()
      .validate(() => StringValidator.isRequired(date, 'date'))
      .validate(() => StringValidator.isString(date, 'date'));

    if (!validator.isValid()) {
      return {
        valid: false,
        error: ApiError.validationError(validator.getErrors()[0]),
      };
    }

    return { valid: true };
  }
}
