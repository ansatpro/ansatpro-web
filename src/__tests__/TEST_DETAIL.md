# ANSAT Pro Test Documentation

This document provides an overview of the testing approach, test coverage, and guidelines for testing the ANSAT Pro web application.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Categories](#test-categories)
3. [Testing Environment Setup](#testing-environment-setup)
4. [Running Tests](#running-tests)
5. [Unit Tests](#unit-tests)
6. [End-to-End Tests](#end-to-end-tests)
7. [API Integration Tests](#api-integration-tests)
8. [Test Utilities](#test-utilities)
9. [Coverage Report](#coverage-report)
10. [Future Improvements](#future-improvements)

## Testing Overview

The ANSAT Pro web application uses a comprehensive testing strategy that includes unit tests, end-to-end tests, and API integration tests. This approach ensures that all aspects of the application are thoroughly tested, from individual components to complete user flows.

**Testing Framework:** Vitest (for unit and API tests), Selenium (for end-to-end tests)

**Testing Philosophy:**
- Test business logic thoroughly
- Focus on user-critical paths
- Maintain high test coverage for core components
- Use mock data to isolate components and services
- Ensure tests run quickly and reliably

## Test Categories

### Unit Tests
- **Purpose**: Test individual components, hooks, utilities, and functions in isolation
- **Tools**: Vitest, React Testing Library
- **Location**: `/src/__tests__/`

### End-to-End Tests
- **Purpose**: Test complete user flows and interactions with the application
- **Tools**: Selenium WebDriver, Chrome driver
- **Location**: `/src/__tests__/selenium/`

### API Integration Tests
- **Purpose**: Test integration with backend services and APIs
- **Tools**: Vitest, Appwrite SDK, Node-fetch
- **Location**: `/src/__tests__/api/`

## Testing Environment Setup

### Prerequisites
- Node.js (v16.x or higher)
- npm/pnpm
- Chrome browser (for Selenium tests)
- Appwrite backend (for API tests)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Install Chrome WebDriver (required for Selenium tests)

### Configuration
- Environment variables for API tests are stored in `.env.test` file
- Test data should be isolated from production data

## Running Tests

### All Tests
```bash
npm run test
```

### Unit Tests Only
```bash
npm run test:unit
```

### End-to-End Tests Only
```bash
npm run test:e2e
```

### API Tests Only
```bash
npm run test:api
```

## Unit Tests

Unit tests cover individual components, hooks, context providers, and utility functions to ensure they work correctly in isolation.

### Component Tests
- `Button.test.js`: Tests the Button component's rendering and interactions
- `ClientSideJWTRefresher.test.js`: Tests JWT refresher component functionality
- `TextPressure.test.js`: Tests TextPressure component rendering and state

### Hook Tests
- `useAutoRefreshJWT.test.js`: Tests JWT token refresh hook functionality

### Context Tests
- `NotificationsContext.test.js`: Tests notification context providers and consumers
- `NavigationContext.test.js`: Tests navigation context functionality

### Utility Tests
- `utils.test.js`: Tests utility functions like `cn` for class name handling

### Authentication Tests
- `LoginLogout.test.js`: Tests login and logout functionality

### Notification Tests
- `NotificationHandling.test.js`: Tests notification handling

## End-to-End Tests

End-to-end tests verify that the application works correctly from a user's perspective by simulating user interactions with the application.

### Test Scenarios
- **Home Page Loading**: Verifies that the home page loads correctly
- **User Login Flow**: Tests the complete login process
- **Navigation Menu**: Ensures navigation menu works correctly
- **Notifications Access**: Tests accessing and viewing notifications
- **Student Registration Form**: Tests form validation for student registration
- **Logout Functionality**: Verifies logout process
- **Responsive Design**: Tests application responsiveness on mobile viewports

### Example Test
```javascript
test('User login flow', async () => {
  // Navigate to login page
  await driver.get('http://localhost:3000/auth/login');
  
  // Enter credentials
  await driver.findElement(By.id('email')).sendKeys(TEST_EMAIL);
  await driver.findElement(By.id('password')).sendKeys(TEST_PASSWORD);
  
  // Submit form
  await driver.findElement(By.xpath('//button[contains(text(), "Sign in")]')).click();
  
  // Wait for redirect to home page
  await driver.wait(until.urlContains('/home'), 5000);
  
  // Verify welcome message is displayed
  const welcomeText = await driver.findElement(By.xpath("//*[contains(text(), 'Good')]"));
  expect(await welcomeText.isDisplayed()).toBe(true);
});
```

## API Integration Tests

API tests verify that the application correctly integrates with backend services and APIs.

### Test Categories
- **Authentication API**: Tests for authentication endpoints
- **Student API**: Tests for student management endpoints
- **Notification API**: Tests for notification endpoints
- **Feedback API**: Tests for feedback submission and retrieval

### Example Test
```javascript
test('Can fetch all students with authentication', async () => {
  // Skip if no JWT token
  if (!JWT_TOKEN) {
    console.warn('Skipping test due to missing JWT token');
    return;
  }
  
  const students = await mockGetAllStudents();
  
  // Verify the response
  expect(Array.isArray(students)).toBe(true);
  expect(students.length).toBeGreaterThan(0);
  expect(students[0]).toHaveProperty('firstName');
  expect(students[0]).toHaveProperty('lastName');
  expect(students[0]).toHaveProperty('studentId');
});
```

## Test Utilities

Test utilities provide helper functions and mock implementations to facilitate testing.

### Utility Functions
- `renderWithProviders`: Renders components with necessary context providers
- `mockLocalStorage`: Mocks localStorage for tests
- `mockAppwriteServices`: Mocks Appwrite SDK services
- `createMockNavigator`: Creates a mock navigation context

### Location
- `/src/__tests__/utils/test-utils.js`

## Coverage Report

Current test coverage by category:

| Category        | Files   | Coverage |
| --------------- | ------- | -------- |
| Components      | 3/25    | 12%      |
| Hooks           | 1/4     | 25%      |
| Context         | 2/3     | 67%      |
| Utilities       | 1/5     | 20%      |
| Auth            | 1/2     | 50%      |
| API Integration | 4/8     | 50%      |
| End-to-End      | 7 flows | N/A      |

## Future Improvements

1. **Increase Component Test Coverage**: Add tests for remaining UI components
2. **Real API Integration Tests**: Replace mock functions with actual API calls in a test environment
3. **Cross-Browser Testing**: Extend E2E tests to run on multiple browsers (Firefox, Safari)
4. **Performance Tests**: Add tests to measure application performance
5. **Visual Regression Tests**: Add tests to catch UI changes
6. **Accessibility Tests**: Add tests to verify application accessibility
7. **CI/CD Integration**: Integrate tests with CI/CD pipeline
8. **Load Testing**: Add tests to verify application performance under load
9. **Snapshot Testing**: Add snapshot tests for UI components
10. **Mobile Testing**: Add tests specifically for mobile views and interactions

## Contributing to Tests

When contributing new features or fixing bugs, please follow these guidelines:

1. Write tests for new features before implementation (TDD approach)
2. Update existing tests when modifying functionality
3. Ensure all tests pass before submitting a PR
4. Keep tests focused, fast, and independent of each other
5. Use descriptive test names that explain what is being tested
6. Avoid testing implementation details; focus on behavior
7. Follow the existing test structure and naming conventions
