/**
 * Adds two numbers together.
 *
 * @param a - The first number to add
 * @param b - The second number to add
 * @returns The sum of a and b
 *
 * @example
 * ```typescript
 * const result = sum(2, 3); // Returns 5
 * const negativeResult = sum(-2, -3); // Returns -5
 * ```
 */
export function sum(a: number, b: number) {
  return a + b;
}

/**
 * Subtracts the second number from the first number.
 *
 * @param a - The number to subtract from (minuend)
 * @param b - The number to subtract (subtrahend)
 * @returns The difference of a minus b
 *
 * @example
 * ```typescript
 * const result = rest(5, 3); // Returns 2
 * const negativeResult = rest(-5, -3); // Returns -2
 * ```
 */
export function rest(a: number, b: number) {
  return a - b;
}

/**
 * Multiplies two numbers together.
 *
 * @param a - The first number to multiply
 * @param b - The second number to multiply
 * @returns The product of a and b
 *
 * @example
 * ```typescript
 * const result = multiply(2, 3); // Returns 6
 * const negativeResult = multiply(-2, -3); // Returns 6
 * const zeroResult = multiply(0, 3); // Returns 0
 * ```
 */
export function multiply(a: number, b: number) {
  return a * b;
}

/**
 * Divides the first number by the second number.
 *
 * @param a - The dividend (number to be divided)
 * @param b - The divisor (number to divide by)
 * @returns The quotient of a divided by b
 * @throws {Error} When attempting to divide by zero
 *
 * @example
 * ```typescript
 * const result = division(6, 3); // Returns 2
 * const decimalResult = division(7, 2); // Returns 3.5
 *
 * // This will throw an error:
 * // division(5, 0); // Throws "Division by zero is not allowed."
 * ```
 */
export function division(a: number, b: number) {
  if (b === 0) {
    throw new Error("Division by zero is not allowed.");
  }

  return a / b;
}
