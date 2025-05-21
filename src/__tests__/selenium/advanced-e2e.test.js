/**
 * Advanced Selenium UI automated tests for ANSAT Pro
 * This file contains additional end-to-end tests for the ANSAT Pro web application
 * using Selenium WebDriver, focusing on more complex user flows.
 */

import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

// Test email and password for login tests
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Password123!';

// Mock student data for testing
const TEST_STUDENT = {
  firstName: 'Test',
  lastName: 'Student',
  studentId: 'S123456',
  email: 'teststudent@example.com',
  universityId: '1', // Assuming this is a valid university ID
  healthServiceId: '1', // Assuming this is a valid health service ID
  clinicAreaId: '1', // Assuming this is a valid clinic area ID
  startDate: '2023-06-01',
  endDate: '2023-12-31'
};

// Test feedback data
const TEST_FEEDBACK = {
  feedbackText: 'This student has shown excellent clinical reasoning skills and strong patient communication abilities.',
  flagDiscussWithFacilitator: true,
  discussionDate: '2023-07-15'
};

// Create a new driver for each test suite
let driver;

// Setup before all tests
beforeAll(async () => {
  // Set up Chrome options (headless mode for CI/CD environments)
  const options = new chrome.Options();
  
  // Uncomment for headless testing
  // options.addArguments('--headless');
  options.addArguments('--window-size=1920,1080');
  
  // Initialize the driver
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  // Set implicit wait time
  await driver.manage().setTimeouts({ implicit: 5000 });
}, 10000);

// Cleanup after all tests
afterAll(async () => {
  // Close the browser
  if (driver) {
    await driver.quit();
  }
}, 5000);

/**
 * Helper functions
 */
async function login() {
  // Navigate to login page
  await driver.get('http://localhost:3000/auth/login');
  
  // Find and fill login form
  await driver.findElement(By.id('email')).sendKeys(TEST_EMAIL);
  await driver.findElement(By.id('password')).sendKeys(TEST_PASSWORD);
  
  // Submit form
  await driver.findElement(By.xpath('//button[contains(text(), "Sign in")]')).click();
  
  // Wait for redirect to home page
  await driver.wait(until.urlContains('/home'), 5000);
}

// Helper to take screenshot when test fails
async function takeScreenshotOnFailure(testName) {
  try {
    const screenshot = await driver.takeScreenshot();
    console.log(`Screenshot taken for failed test: ${testName}`);
    // In a real implementation, save the screenshot to a file
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

describe('ANSAT Pro Advanced E2E Tests', () => {
  test('Dashboard analytics loading and interaction', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to dashboard
      await driver.get('http://localhost:3000/facilitator/dashboard');
      
      // Wait for dashboard to load (look for charts or data elements)
      await driver.wait(until.elementLocated(By.css('.dashboard-statistics')), 10000);
      
      // Verify dashboard contains expected elements
      const statsElements = await driver.findElements(By.css('.stat-card'));
      expect(statsElements.length).toBeGreaterThan(0);
      
      // Check interactive elements on dashboard
      const filterDropdown = await driver.findElement(By.css('select.filter-dropdown'));
      await filterDropdown.click();
      
      // Select a different time period
      const optionElements = await driver.findElements(By.css('option'));
      await optionElements[1].click();
      
      // Wait for dashboard to refresh with new data
      await driver.sleep(1000); // Allow time for data to refresh
      
      // Verify data has been updated
      const updatedStats = await driver.findElements(By.css('.stat-card'));
      expect(updatedStats.length).toBeGreaterThan(0);
    } catch (error) {
      await takeScreenshotOnFailure('dashboard-test');
      throw error;
    }
  }, 20000);
  
  test('Complete student registration process', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to student registration page
      await driver.get('http://localhost:3000/facilitator/student/studentRegister');
      
      // Fill out the registration form with test data
      await driver.findElement(By.id('firstName')).sendKeys(TEST_STUDENT.firstName);
      await driver.findElement(By.id('lastName')).sendKeys(TEST_STUDENT.lastName);
      await driver.findElement(By.id('studentId')).sendKeys(TEST_STUDENT.studentId);
      await driver.findElement(By.id('email')).sendKeys(TEST_STUDENT.email);
      
      // Handle dropdowns
      // University
      const universitySelect = await driver.findElement(By.id('universityId'));
      await universitySelect.click();
      await driver.findElement(By.css(`option[value="${TEST_STUDENT.universityId}"]`)).click();
      
      // Health Service
      const healthServiceSelect = await driver.findElement(By.id('healthServiceId'));
      await healthServiceSelect.click();
      await driver.findElement(By.css(`option[value="${TEST_STUDENT.healthServiceId}"]`)).click();
      
      // Clinic Area
      const clinicAreaSelect = await driver.findElement(By.id('clinicAreaId'));
      await clinicAreaSelect.click();
      await driver.findElement(By.css(`option[value="${TEST_STUDENT.clinicAreaId}"]`)).click();
      
      // Dates - assuming date picker fields with IDs
      await driver.findElement(By.id('startDate')).sendKeys(TEST_STUDENT.startDate);
      await driver.findElement(By.id('endDate')).sendKeys(TEST_STUDENT.endDate);
      
      // Submit form
      const submitButton = await driver.findElement(By.xpath('//button[contains(text(), "Register Student")]'));
      await submitButton.click();
      
      // Wait for success message or redirection
      await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
      
      // Verify success
      const successMessage = await driver.findElement(By.css('.success-message'));
      expect(await successMessage.isDisplayed()).toBe(true);
    } catch (error) {
      await takeScreenshotOnFailure('student-registration-test');
      throw error;
    }
  }, 30000);
  
  test('Student feedback submission flow', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to student list
      await driver.get('http://localhost:3000/preceptor/students');
      
      // Wait for student list to load
      await driver.wait(until.elementLocated(By.css('.student-list')), 10000);
      
      // Click on first student
      const firstStudent = await driver.findElement(By.css('.student-item'));
      await firstStudent.click();
      
      // Wait for student profile to load
      await driver.wait(until.elementLocated(By.css('.student-profile')), 5000);
      
      // Click on "Add Feedback" button
      const addFeedbackButton = await driver.findElement(By.xpath('//button[contains(text(), "Add Feedback")]'));
      await addFeedbackButton.click();
      
      // Wait for feedback form
      await driver.wait(until.elementLocated(By.css('.feedback-form')), 5000);
      
      // Fill out feedback form
      const feedbackTextArea = await driver.findElement(By.id('feedbackText'));
      await feedbackTextArea.sendKeys(TEST_FEEDBACK.feedbackText);
      
      // Check the "Flag for discussion with facilitator" checkbox
      const discussWithFacilitatorCheckbox = await driver.findElement(By.id('flagDiscussWithFacilitator'));
      await discussWithFacilitatorCheckbox.click();
      
      // Set discussion date
      const discussionDateInput = await driver.findElement(By.id('discussionDate'));
      await discussionDateInput.sendKeys(TEST_FEEDBACK.discussionDate);
      
      // Submit feedback
      const submitFeedbackButton = await driver.findElement(By.xpath('//button[contains(text(), "Submit Feedback")]'));
      await submitFeedbackButton.click();
      
      // Wait for success message
      await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
      
      // Verify success
      const successMessage = await driver.findElement(By.css('.success-message'));
      expect(await successMessage.isDisplayed()).toBe(true);
    } catch (error) {
      await takeScreenshotOnFailure('feedback-submission-test');
      throw error;
    }
  }, 30000);
  
  test('Profile page and settings', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to profile page
      await driver.get('http://localhost:3000/profile');
      
      // Wait for profile page to load
      await driver.wait(until.elementLocated(By.css('.profile-page')), 5000);
      
      // Verify profile information is displayed
      const profileInfo = await driver.findElement(By.css('.user-info'));
      expect(await profileInfo.isDisplayed()).toBe(true);
      
      // Test editing profile
      const editButton = await driver.findElement(By.xpath('//button[contains(text(), "Edit Profile")]'));
      await editButton.click();
      
      // Wait for edit form
      await driver.wait(until.elementLocated(By.css('.edit-profile-form')), 5000);
      
      // Update a field (e.g., phone number)
      const phoneInput = await driver.findElement(By.id('phone'));
      await phoneInput.clear();
      await phoneInput.sendKeys('555-123-4567');
      
      // Save changes
      const saveButton = await driver.findElement(By.xpath('//button[contains(text(), "Save Changes")]'));
      await saveButton.click();
      
      // Wait for success message
      await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
      
      // Verify success
      const successMessage = await driver.findElement(By.css('.success-message'));
      expect(await successMessage.isDisplayed()).toBe(true);
    } catch (error) {
      await takeScreenshotOnFailure('profile-settings-test');
      throw error;
    }
  }, 20000);
  
  test('Generate and download student reports', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to reports page
      await driver.get('http://localhost:3000/facilitator/reports');
      
      // Wait for reports page to load
      await driver.wait(until.elementLocated(By.css('.reports-page')), 5000);
      
      // Select report type (e.g., Student Progress)
      const reportTypeSelect = await driver.findElement(By.id('reportType'));
      await reportTypeSelect.click();
      await driver.findElement(By.xpath('//option[contains(text(), "Student Progress")]')).click();
      
      // Select student
      const studentSelect = await driver.findElement(By.id('studentId'));
      await studentSelect.click();
      await driver.findElement(By.css('option[value="1"]')).click();
      
      // Set date range
      const startDateInput = await driver.findElement(By.id('startDate'));
      await startDateInput.sendKeys('2023-01-01');
      
      const endDateInput = await driver.findElement(By.id('endDate'));
      await endDateInput.sendKeys('2023-12-31');
      
      // Generate report
      const generateButton = await driver.findElement(By.xpath('//button[contains(text(), "Generate Report")]'));
      await generateButton.click();
      
      // Wait for report to generate
      await driver.wait(until.elementLocated(By.css('.report-preview')), 10000);
      
      // Verify report is displayed
      const reportPreview = await driver.findElement(By.css('.report-preview'));
      expect(await reportPreview.isDisplayed()).toBe(true);
      
      // Download report
      const downloadButton = await driver.findElement(By.xpath('//button[contains(text(), "Download PDF")]'));
      await downloadButton.click();
      
      // Just wait a bit for download to start (hard to verify download completion with Selenium)
      await driver.sleep(2000);
    } catch (error) {
      await takeScreenshotOnFailure('reports-test');
      throw error;
    }
  }, 30000);
  
  test('Search functionality', async () => {
    try {
      // Login first
      await login();
      
      // Navigate to students page
      await driver.get('http://localhost:3000/facilitator/students');
      
      // Wait for page to load
      await driver.wait(until.elementLocated(By.css('.search-input')), 5000);
      
      // Search for a student
      const searchInput = await driver.findElement(By.css('.search-input'));
      await searchInput.sendKeys('Test');
      await searchInput.sendKeys(Key.RETURN);
      
      // Wait for search results
      await driver.sleep(1000); // Allow time for search to process
      
      // Verify search results
      const searchResults = await driver.findElements(By.css('.student-item'));
      
      // There should be at least one result (our test student)
      expect(searchResults.length).toBeGreaterThan(0);
      
      // Clear search
      await searchInput.clear();
      await searchInput.sendKeys(Key.RETURN);
      
      // Wait for full list to reload
      await driver.sleep(1000);
      
      // Verify original list is restored
      const allStudents = await driver.findElements(By.css('.student-item'));
      expect(allStudents.length).toBeGreaterThanOrEqual(searchResults.length);
    } catch (error) {
      await takeScreenshotOnFailure('search-test');
      throw error;
    }
  }, 20000);
  
  test('Dark mode toggle', async () => {
    try {
      // Login first
      await login();
      
      // Find theme toggle button
      const themeToggle = await driver.findElement(By.css('.theme-toggle'));
      
      // Get current body class (to check if dark mode is initially enabled)
      const initialBodyClass = await driver.findElement(By.css('body')).getAttribute('class');
      const initialIsDarkMode = initialBodyClass.includes('dark');
      
      // Toggle theme
      await themeToggle.click();
      
      // Wait for theme change
      await driver.sleep(1000);
      
      // Get updated body class
      const updatedBodyClass = await driver.findElement(By.css('body')).getAttribute('class');
      const updatedIsDarkMode = updatedBodyClass.includes('dark');
      
      // Verify theme changed
      expect(updatedIsDarkMode).not.toBe(initialIsDarkMode);
      
      // Toggle back to original theme
      await themeToggle.click();
      
      // Wait for theme change
      await driver.sleep(1000);
      
      // Verify theme reverted
      const finalBodyClass = await driver.findElement(By.css('body')).getAttribute('class');
      const finalIsDarkMode = finalBodyClass.includes('dark');
      expect(finalIsDarkMode).toBe(initialIsDarkMode);
    } catch (error) {
      await takeScreenshotOnFailure('dark-mode-test');
      throw error;
    }
  }, 15000);
});
