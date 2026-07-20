/**
 * Returns a suggested decimal precision for fixed-point notation given a step value.
 *
 * Direct port of d3-format's `precisionFixed`:
 * https://github.com/d3/d3-format/blob/main/src/precisionFixed.js
 *
 * Examples:
 *   precisionFixed(10)      === 0
 *   precisionFixed(1)       === 0
 *   precisionFixed(0.1)     === 1
 *   precisionFixed(0.001)   === 3
 *   precisionFixed(0.00001) === 5
 */
export function precisionFixed(step: number): number {
  return Math.max(0, -exponent(Math.abs(step)));
}

function exponent(x: number): number {
  // 1e-12 absorbs float error near integer boundaries (e.g. log10(0.0001) is
  // -4.000000000000001) so floor doesn't drop a digit of precision.
  return x === 0 ? 0 : Math.floor(Math.log(x) / Math.LN10 + 1e-12);
}
