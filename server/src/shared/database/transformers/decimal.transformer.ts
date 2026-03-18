import { ValueTransformer } from 'typeorm';

/**
 * Transforms TypeORM decimal columns to numbers on read.
 *
 * TypeORM (and its drivers) returns decimal/numeric columns as strings to
 * avoid precision loss at the driver level.
 * Without this transformer, TypeScript's `number` type annotation is
 * a lie — arithmetic will silently produce string concatenation or NaN.
 *
 * Note: JavaScript's `number` is an IEEE 754 float and cannot represent all
 * decimal values exactly. For production financial calculations, replace
 * `parseFloat` here with a decimal library (e.g. decimal.js) and store
 * amounts as integers (cents) or use string-based arithmetic throughout.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | number | null): number | null => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = parseFloat(String(value));

    return isNaN(parsed) ? null : parsed;
  },
};
