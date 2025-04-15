# Guide for Writing Test Cases Using Vitest

This file serves as a guide for writing test cases using Vitest, a JavaScript and TypeScript testing framework. It also outlines the naming conventions for test files in this project.

## Run all the unit tests
```bash
npm run test
# or
npm test
```

## Writing Tests
- Import the necessary functions from Vitest, such as `test` and `expect`.
- Define the function or module you want to test.
- Use the `test` function to create test cases. Each test case should have:
  - A descriptive name indicating what is being tested.
  - Assertions using `expect` to verify the expected behavior.

## Naming Conventions
- Test files should be placed in the `src/app/__tests__` directory.
- The file name should match the module or functionality being tested, followed by `.test.js`.
  For example, if testing a `sum` function, the file name should be `sum.test.js`.

## Example
```javascript
import { expect, test } from 'vitest';

const sum = (a, b) => a + b;

test('sum', () => {
  expect(sum(1, 2)).toBe(3);
});