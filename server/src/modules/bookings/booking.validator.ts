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

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

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

  static validateDateParam(date: string): ValidationResult {
    if (!DATE_REGEX.test(date)) {
      return {
        valid: false,
        error: ApiError.validationError('Invalid date format. Use YYYY-MM-DD'),
      };
    }
    return { valid: true };
  }

  static validateDateTimeParams(date: string, time: string): ValidationResult {
    if (!DATE_REGEX.test(date)) {
      return {
        valid: false,
        error: ApiError.validationError('Invalid date format. Use YYYY-MM-DD'),
      };
    }

    if (!TIME_REGEX.test(time)) {
      return {
        valid: false,
        error: ApiError.validationError(
          'Invalid time format. Use HH:MM (24-hour format)'
        ),
      };
    }

    if (new Date(`${date}T${time}:00`) <= new Date()) {
      return {
        valid: false,
        error: ApiError.validationError('Cannot book a time slot in the past'),
      };
    }

    return { valid: true };
  }

  static validateCheckIn(booking: {
    paymentMethod: PaymentMethod;
    status: BookingStatus;
    stripePaymentIntentId: string | null;
  }): ValidationResult {
    if (booking.paymentMethod === PaymentMethod.CASH) {
      if (booking.status !== BookingStatus.CONFIRMED) {
        return {
          valid: false,
          error: ApiError.validationError(
            `Cannot check in cash booking with status ${booking.status}. Must be CONFIRMED.`
          ),
        };
      }

      return { valid: true };
    }

    // STRIPE path
    if (booking.status !== BookingStatus.AUTHORIZED) {
      return {
        valid: false,
        error: ApiError.validationError(
          `Cannot check in card booking with status ${booking.status}. Must be AUTHORIZED.`
        ),
      };
    }

    if (!booking.stripePaymentIntentId) {
      return {
        valid: false,
        error: ApiError.validationError(
          'Stripe booking is missing payment intent ID'
        ),
      };
    }

    return { valid: true };
  }

  static validateComplete(booking: {
    status: BookingStatus;
  }): ValidationResult {
    if (booking.status !== BookingStatus.CHECKED_IN) {
      return {
        valid: false,
        error: ApiError.validationError(
          `Cannot complete booking with status ${booking.status}. Must be CHECKED_IN.`
        ),
      };
    }
    return { valid: true };
  }

  static validateNoShow(booking: { status: BookingStatus }): ValidationResult {
    const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.AUTHORIZED];

    if (!allowedStatuses.includes(booking.status)) {
      return {
        valid: false,
        error: ApiError.validationError(
          `Cannot mark booking with status ${booking.status} as no-show. Must be CONFIRMED or AUTHORIZED.`
        ),
      };
    }

    return { valid: true };
  }

  static validateCancel(booking: {
    status: BookingStatus;
    appointmentDatetime: Date | string;
  }): ValidationResult {
    const cancellableStatuses: BookingStatus[] = [
      BookingStatus.CONFIRMED,
      BookingStatus.AUTHORIZED,
      BookingStatus.PENDING_PAYMENT,
    ];

    if (!cancellableStatuses.includes(booking.status)) {
      return {
        valid: false,
        error: ApiError.validationError(
          `Booking cannot be cancelled in ${booking.status} status`
        ),
      };
    }

    const cutoff = new Date(
      new Date(booking.appointmentDatetime).getTime() - 15 * 60 * 1000
    );

    if (new Date() >= cutoff) {
      return {
        valid: false,
        error: ApiError.validationError(
          'Booking can only be cancelled at least 15 minutes before the appointment time'
        ),
      };
    }

    return { valid: true };
  }
}
