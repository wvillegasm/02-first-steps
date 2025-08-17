export function sum(a: number, b: number) {
  return a + b;
}

export function rest(a: number, b: number) {
  return a - b;
}

export function multiply(a: number, b: number) {
  return a * b;
}

export function division(a: number, b: number) {
  if (b === 0) {
    throw new Error("Division by zero is not allowed.");
  }

  return a / b;
}
