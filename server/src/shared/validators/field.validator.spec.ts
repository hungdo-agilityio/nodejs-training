import { describe, it, expect } from 'vitest';
import { FieldValidator } from './field.validator';

describe('FieldValidator', () => {
  it('is valid when no errors are added', () => {
    const v = new FieldValidator();
    expect(v.isValid()).toBe(true);
    expect(v.getErrors()).toEqual([]);
  });

  it('collects errors from failing validations', () => {
    const v = new FieldValidator()
      .validate(() => 'name is required')
      .validate(() => 'email is required');

    expect(v.isValid()).toBe(false);
    expect(v.getErrors()).toEqual(['name is required', 'email is required']);
  });

  it('skips null returns (passing validations)', () => {
    const v = new FieldValidator()
      .validate(() => null)
      .validate(() => 'age must be a number')
      .validate(() => null);

    expect(v.isValid()).toBe(false);
    expect(v.getErrors()).toEqual(['age must be a number']);
  });

  it('supports chaining and returns itself', () => {
    const v = new FieldValidator();
    const result = v.validate(() => null);
    expect(result).toBe(v);
  });

  it('is valid when all validations pass', () => {
    const v = new FieldValidator().validate(() => null).validate(() => null);

    expect(v.isValid()).toBe(true);
    expect(v.getErrors()).toEqual([]);
  });
});
