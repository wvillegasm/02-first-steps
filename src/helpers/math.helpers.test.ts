import { division, multiply, rest, sum } from './math.helpers';

describe('add operations', () => {
  test('sum with positive numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  test('sum with negative numbers', () => {
    expect(sum(-2, -3)).toBe(-5);
  });
});

describe('rest operations', () => {
  test('rest with positive numbers', () => {
    expect(rest(5, 3)).toBe(2);
  });

  test('rest with negative numbers', () => {
    expect(rest(-5, -3)).toBe(-2);
  });
});

describe('multiply operations', () => {
  test('multiply with positive numbers', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  test('multiply with negative numbers', () => {
    expect(multiply(-2, -3)).toBe(6);
  });

  test('multiply with zero', () => {
    expect(multiply(0, 3)).toBe(0);
  });
});

describe('division operations', () => {
  test('division with positive numbers', () => {
    expect(division(6, 3)).toBe(2);
  });

  test('division with zero', () => {
    // Division by zero should throw an error
    expect(() => division(6, 0)).toThrowError('Division by zero is not allowed.');
  });
});
