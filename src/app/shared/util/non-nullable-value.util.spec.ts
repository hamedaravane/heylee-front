import {getNonNullableValue} from './non-nullable-value.util';

describe('getNonNullableValue', () => {
  it('should return an object with non-nullable properties when all inputs are non-null', () => {
    const input = {
      name: 'John',
      age: 30,
      isActive: true
    };

    const result = getNonNullableValue(input);

    expect(result).toEqual(input);
  });

  it('should throw an error when a property is null', () => {
    const input = {
      name: 'John',
      age: null,
      isActive: true
    };

    expect(() => getNonNullableValue(input)).toThrowError('Property age is null or undefined');
  });

  it('should throw an error when a property is undefined', () => {
    const input = {
      name: 'John',
      age: 30,
      isActive: undefined
    };

    expect(() => getNonNullableValue(input)).toThrowError('Property isActive is null or undefined');
  });

  it('should handle nested objects', () => {
    const input = {
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown'
      }
    };

    const result = getNonNullableValue(input);

    expect(result).toEqual(input);
  });

  it('should throw an error for nested null properties', () => {
    const input = {
      name: 'John',
      address: {
        street: '123 Main St',
        city: null
      }
    };

    expect(() => getNonNullableValue(input)).not.toThrow();
    expect(() => getNonNullableValue(input.address)).toThrowError('Property city is null or undefined');
  });
});