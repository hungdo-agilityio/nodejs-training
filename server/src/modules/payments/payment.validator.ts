import { ApiError } from '@shared/errors';
import {
  FieldValidator,
  StringValidator,
  ArrayValidator,
  ValidationResult,
} from '@shared/validators';

export class PaymentValidator {
  static validateAuthorize(body: Record<string, unknown>): ValidationResult {
    const { bookingId, idempotencyKey } = body;

    const validator = new FieldValidator()
      .validate(() => StringValidator.isRequired(bookingId, 'bookingId'))
      .validate(() =>
        StringValidator.isRequired(idempotencyKey, 'idempotencyKey')
      );

    if (!validator.isValid()) {
      return {
        valid: false,
        error: ApiError.validationError(validator.getErrors()[0]),
      };
    }

    return { valid: true };
  }

  static validateCreateIntent(body: Record<string, unknown>): ValidationResult {
    const { serviceIds, appointmentDate, appointmentTime } = body;

    const validator = new FieldValidator()
      .validate(() => ArrayValidator.isNonEmpty(serviceIds, 'serviceIds'))
      .validate(() =>
        StringValidator.isRequired(appointmentDate, 'appointmentDate')
      )
      .validate(() =>
        StringValidator.isRequired(appointmentTime, 'appointmentTime')
      );

    if (!validator.isValid()) {
      return {
        valid: false,
        error: ApiError.validationError(validator.getErrors()[0]),
      };
    }

    return { valid: true };
  }
}
