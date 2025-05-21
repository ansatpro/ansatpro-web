/**
 * Selenium UI automated tests for ANSAT Pro
 * This file contains end-to-end tests for the ANSAT Pro web application
 * using Selenium WebDriver.
 */

import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

// Test email and password for login tests
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "Password123!";

// Create a new driver for each test suite
let driver;

// Setup before all tests
beforeAll(async () => {
  // Set up Chrome options (headless mode for CI/CD environments)
  const options = new chrome.Options();

  // Uncomment for headless testing
  // options.addArguments('--headless');
  options.addArguments("--window-size=1920,1080");

  // Initialize the driver
  driver = await new Builder()
    .forBrowser("chrome")
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
  await driver.get("http://localhost:3000/auth/login");

  // Find and fill login form
  await driver.findElement(By.id("email")).sendKeys(TEST_EMAIL);
  await driver.findElement(By.id("password")).sendKeys(TEST_PASSWORD);

  // Submit form
  await driver
    .findElement(By.xpath('//button[contains(text(), "Sign in")]'))
    .click();

  // Wait for redirect to home page
  await driver.wait(until.urlContains("/home"), 5000);
}

describe("ANSAT Pro E2E Tests", () => {
  test("Home page loads correctly", async () => {
    // Navigate to the homepage
    await driver.get("http://localhost:3000");

    // Verify page title
    const title = await driver.getTitle();
    expect(title).toContain("ANSAT Pro");

    // Check for key elements
    const logoElement = await driver.findElement(
      By.css('img[alt="ANSAT Pro"]')
    );
    expect(await logoElement.isDisplayed()).toBe(true);
  }, 10000);

  test("User login flow", async () => {
    // Navigate to login page
    await driver.get("http://localhost:3000/auth/login");

    // Verify login form is displayed
    const emailInput = await driver.findElement(By.id("email"));
    const passwordInput = await driver.findElement(By.id("password"));
    const loginButton = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign in")]')
    );

    expect(await emailInput.isDisplayed()).toBe(true);
    expect(await passwordInput.isDisplayed()).toBe(true);
    expect(await loginButton.isDisplayed()).toBe(true);

    // Enter credentials
    await emailInput.sendKeys(TEST_EMAIL);
    await passwordInput.sendKeys(TEST_PASSWORD);

    // Submit form
    await loginButton.click();

    // Wait for redirect to home page (facilitator or preceptor)
    try {
      await driver.wait(until.urlContains("/home"), 5000);

      // Verify welcome message is displayed
      const welcomeText = await driver.findElement(
        By.xpath("//*[contains(text(), 'Good')]")
      );
      expect(await welcomeText.isDisplayed()).toBe(true);
    } catch (error) {
      // If login fails, capture screenshot and log error
      const screenshot = await driver.takeScreenshot();
      console.error("Login failed, see screenshot for details");
      throw error;
    }
  }, 15000);

  test("Navigation menu works correctly", async () => {
    // Login first
    await login();

    // Click on each navigation item and verify URL change
    const navItems = await driver.findElements(By.css("nav a"));

    // Skip first item (home) since we're already there
    for (let i = 1; i < navItems.length; i++) {
      const item = navItems[i];
      const href = await item.getAttribute("href");

      // Click on the nav item
      await item.click();

      // Wait for URL change
      await driver.wait(until.urlIs(href), 5000);

      // Verify current URL matches expected URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toBe(href);

      // Get fresh references to nav items since the DOM has changed
      navItems = await driver.findElements(By.css("nav a"));
    }
  }, 30000);

  test("Notifications can be accessed", async () => {
    // Login first
    await login();

    // Find and click notifications button
    const notificationBtn = await driver.findElement(
      By.css('button[aria-label="Notifications"]')
    );
    await notificationBtn.click();

    // Wait for notifications page to load
    await driver.wait(until.urlContains("/notification"), 5000);

    // Verify notifications page has loaded
    const pageTitle = await driver.findElement(
      By.xpath('//h1[contains(text(), "Notifications")]')
    );
    expect(await pageTitle.isDisplayed()).toBe(true);
  }, 15000);

  test("Student registration form validation", async () => {
    // Login first
    await login();

    // Navigate to student registration page
    await driver.get(
      "http://localhost:3000/facilitator/student/studentRegister"
    );

    // Find registration form
    const submitButton = await driver.findElement(
      By.xpath('//button[contains(text(), "Register Student")]')
    );

    // Submit empty form
    await submitButton.click();

    // Check for validation errors
    const errorMessages = await driver.findElements(By.css(".text-red-500"));
    expect(errorMessages.length).toBeGreaterThan(0);

    // Fill only some fields and submit again
    await driver.findElement(By.id("firstName")).sendKeys("Test");
    await driver.findElement(By.id("lastName")).sendKeys("Student");
    await submitButton.click();

    // Should still show validation errors
    const errorMessagesAfter = await driver.findElements(
      By.css(".text-red-500")
    );
    expect(errorMessagesAfter.length).toBeGreaterThan(0);
  }, 20000);

  test("Logout functionality", async () => {
    // Login first
    await login();

    // Find and click logout button
    const logoutBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Log out")]')
    );
    await logoutBtn.click();

    // Wait for redirect to login page
    await driver.wait(until.urlContains("/auth/login"), 5000);

    // Verify redirect to login page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/auth/login");

    // Verify login form is displayed again
    const emailInput = await driver.findElement(By.id("email"));
    expect(await emailInput.isDisplayed()).toBe(true);
  }, 15000);

  test("Responsive design on mobile viewport", async () => {
    // Set viewport to mobile size
    await driver.manage().window().setRect({ width: 375, height: 667 });

    // Navigate to homepage
    await driver.get("http://localhost:3000");

    // Verify mobile menu is present
    const mobileMenu = await driver.findElement(By.css(".md\\:hidden"));
    expect(await mobileMenu.isDisplayed()).toBe(true);

    // Check if content is properly sized for mobile
    const mainContent = await driver.findElement(By.css("main"));
    const contentWidth = await mainContent.getRect().then((rect) => rect.width);

    // Content should be sized appropriately for mobile viewport
    expect(contentWidth).toBeLessThanOrEqual(375);

    // Reset viewport
    await driver.manage().window().setRect({ width: 1920, height: 1080 });
  }, 15000);
});
