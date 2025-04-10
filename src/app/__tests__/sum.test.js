/**
 * @fileoverview This file contains a sample test case to demonstrate the use of Vitest,
 * a testing framework for JavaScript and TypeScript. It includes a simple function
 * to calculate the sum of two numbers and a test case to verify its correctness.
 */

import { expect, test } from 'vitest'

/**
 * A simple function that takes two numbers and returns their sum.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 */
const sum = (a, b) => a + b

/**
 * A test case to verify the correctness of the `sum` function.
 * It checks if the function correctly calculates the sum of 1 and 2.
 */
test('sum', () => {
  expect(sum(1, 2)).toBe(3)
})