import { ApiError } from '@shared/errors';
import {
  FieldValidator,
  StringValidator,
  ArrayValidator,
  ValidationResult,
} from '@shared/validators';
import { BookingStatus, PaymentMethod } from '@shared/types';

const VALID_STATUSES = Object.values(BookingStatus);
const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

export class BookingValidator {
  static validateCreate(body: Record<string, unknown>): ValidationResult {
    const {
      serviceIds,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      stripePaymentIntentId,
    } = body;

    const validator = new FieldValidator()
      .validate(() => ArrayValidator.isNonEmpty(serviceIds, 'serviceIds'))
      .validate(() =>
        StringValidator.isRequired(appointmentDate, 'appointmentDate')
      )
      .validate(() =>
        StringValidator.isRequired(appointmentTime, 'appointmentTime')
      )
      .validate(() =>
        StringValidator.isRequired(paymentMethod, 'paymentMethod')
      )
      .validate(() =>
        paymentMethod
          ? StringValidator.isEnum(
              paymentMethod,
              VALID_PAYMENT_METHODS,
              'paymentMethod'
            )
          : null
      )
      .validate(() =>
        paymentMethod === PaymentMethod.STRIPE && !stripePaymentIntentId
          ? 'stripePaymentIntentId is required for STRIPE payments'
          : null
      );

    if (!validator.isValid()) {
      return {
        valid: false,
        error: ApiError.validationError(validator.getErrors()[0]),
      };
    }

    return { valid: true };
  }

  static validateGetBookings(query: Record<string, unknown>): ValidationResult {
    const { status } = query;

    if (!status) return { valid: true };

    const validator = new FieldValidator().validate(() =>
      StringValidator.isEnum(status, VALID_STATUSES, 'status')
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
