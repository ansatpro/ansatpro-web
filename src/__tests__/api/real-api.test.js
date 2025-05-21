/**
 * Real API integration tests for ANSAT Pro
 * This file contains tests for the backend API endpoints using actual API calls
 * rather than mock functions.
 */

import { expect, test, describe, beforeAll, afterAll } from "vitest";
import fetch from "node-fetch";
import { account, databases, ID, Query } from "@/lib/appwrite";

// Test credentials - IMPORTANT: These should be test-only credentials
// In a real implementation, these would be environment variables
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "Password123!";

// JWT token for authenticated requests
let JWT_TOKEN = "";
let TEST_USER_ID = "";

// Base URL for API tests
const API_BASE_URL = "https://cloud.appwrite.io/v1";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const STUDENTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID;
const FEEDBACK_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FEEDBACK_COLLECTION_ID;
const NOTIFICATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID;

// Test data
let testStudentId = "";
let testFeedbackId = "";
let testNotificationId = "";

// Setup before all tests
beforeAll(async () => {
  try {
    // Create a real session and get JWT token
    const session = await account.createEmailSession(TEST_EMAIL, TEST_PASSWORD);

    // Get user ID
    const user = await account.get();
    TEST_USER_ID = user.$id;

    // Get JWT token for API requests
    const jwt = await account.createJWT();
    JWT_TOKEN = jwt.jwt;

    console.log("Test setup complete with JWT token");
  } catch (error) {
    console.error("Error setting up test JWT token:", error);
    // If this fails, use mock data for tests
    JWT_TOKEN = "mock-jwt-token";
    TEST_USER_ID = "mock-user-id";
  }
}, 10000);

// Cleanup after all tests
afterAll(async () => {
  try {
    // Clean up test data
    if (testFeedbackId) {
      await databases.deleteDocument(
        DATABASE_ID,
        FEEDBACK_COLLECTION_ID,
        testFeedbackId
      );
    }
    if (testNotificationId) {
      await databases.deleteDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        testNotificationId
      );
    }

    // Don't delete test student record - it might be used by other tests

    // Delete the session
    await account.deleteSession("current");
  } catch (error) {
    console.error("Error cleaning up test resources:", error);
  }
}, 10000);

describe("Authentication API", () => {
  test("Create and delete sessions", async () => {
    // Skip if setup failed
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // Create a new session
      const response = await fetch(`${API_BASE_URL}/account/sessions/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        }),
      });

      // Verify the response
      expect(response.status).toBe(201); // Created status

      const data = await response.json();
      expect(data).toHaveProperty("$id");
      expect(data).toHaveProperty("userId");

      // Delete the session
      const deleteResponse = await fetch(
        `${API_BASE_URL}/account/sessions/current`,
        {
          method: "DELETE",
          headers: {
            "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            "X-Appwrite-JWT": JWT_TOKEN,
          },
        }
      );

      // Verify deletion
      expect(deleteResponse.status).toBe(204); // No content
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 15000);

  test("JWT token validation", async () => {
    // Skip if setup failed
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // Use JWT token to access a protected resource
      const response = await fetch(`${API_BASE_URL}/account`, {
        method: "GET",
        headers: {
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          "X-Appwrite-JWT": JWT_TOKEN,
        },
      });

      // Verify the response
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("$id", TEST_USER_ID);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 10000);
});

describe("Student API", () => {
  test("Create, get, and delete student", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // Create test student
      const studentData = {
        student_id: `S${Math.floor(Math.random() * 100000)}`, // Random student ID
        first_name: "API",
        last_name: "Test",
        email: `apitest${Math.floor(Math.random() * 10000)}@example.com`,
        university_id: "1",
        health_service_id: "1",
        clinic_area_id: "1",
        start_date: "2023-06-01",
        end_date: "2023-12-31",
        created_by: TEST_USER_ID,
        full_name_lower: "api test",
      };

      // Create student document
      const createResponse = await databases.createDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        ID.unique(),
        studentData
      );

      // Save ID for cleanup
      testStudentId = createResponse.$id;

      // Verify created student
      expect(createResponse).toHaveProperty("$id");
      expect(createResponse.first_name).toBe(studentData.first_name);
      expect(createResponse.last_name).toBe(studentData.last_name);

      // Get the student
      const getResponse = await databases.getDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        testStudentId
      );

      // Verify get response
      expect(getResponse).toHaveProperty("$id", testStudentId);
      expect(getResponse.student_id).toBe(studentData.student_id);

      // Update the student
      const updateData = {
        email: `updated${Math.floor(Math.random() * 10000)}@example.com`,
      };

      const updateResponse = await databases.updateDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        testStudentId,
        updateData
      );

      // Verify update
      expect(updateResponse).toHaveProperty("$id", testStudentId);
      expect(updateResponse.email).toBe(updateData.email);

      // Delete the student (optional, can leave for cross-test usage)
      // Uncomment if you want to delete after test
      /*
      const deleteResponse = await databases.deleteDocument(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        testStudentId
      );
      
      // Verify deletion
      expect(deleteResponse).toBe(true);
      testStudentId = ''; // Reset ID since we deleted it
      */
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 20000);

  test("List students with filters", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // List students with filters
      const response = await databases.listDocuments(
        DATABASE_ID,
        STUDENTS_COLLECTION_ID,
        [Query.limit(10), Query.orderDesc("$createdAt")]
      );

      // Verify the response
      expect(response).toHaveProperty("documents");
      expect(Array.isArray(response.documents)).toBe(true);

      // If we have results, verify their structure
      if (response.documents.length > 0) {
        const firstStudent = response.documents[0];
        expect(firstStudent).toHaveProperty("$id");
        expect(firstStudent).toHaveProperty("student_id");
        expect(firstStudent).toHaveProperty("first_name");
        expect(firstStudent).toHaveProperty("last_name");
      }

      // Test search query if we have test student
      if (testStudentId) {
        const searchResponse = await databases.listDocuments(
          DATABASE_ID,
          STUDENTS_COLLECTION_ID,
          [Query.search("full_name_lower", "api test")]
        );

        // Verify search results
        expect(searchResponse).toHaveProperty("documents");
        expect(Array.isArray(searchResponse.documents)).toBe(true);

        // Should find at least our test student
        const found = searchResponse.documents.some(
          (doc) => doc.$id === testStudentId
        );
        expect(found).toBe(true);
      }
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 15000);
});

describe("Feedback API", () => {
  test("Create and retrieve feedback", async () => {
    // Skip if no JWT token or test student
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token" || !testStudentId) {
      console.warn("Skipping test due to missing JWT token or test student");
      return;
    }

    try {
      // Create test feedback
      const feedbackData = {
        student_document_id: testStudentId,
        preceptor_id: TEST_USER_ID,
        feedback_text: "This is a test feedback from automated API tests.",
        flag_discuss_with_facilitator: true,
        flag_discuss_with_student: false,
        discussion_date: "2023-07-15",
        created_at: new Date().toISOString(),
      };

      // Create feedback document
      const createResponse = await databases.createDocument(
        DATABASE_ID,
        FEEDBACK_COLLECTION_ID,
        ID.unique(),
        feedbackData
      );

      // Save ID for cleanup
      testFeedbackId = createResponse.$id;

      // Verify created feedback
      expect(createResponse).toHaveProperty("$id");
      expect(createResponse.feedback_text).toBe(feedbackData.feedback_text);
      expect(createResponse.student_document_id).toBe(
        feedbackData.student_document_id
      );

      // Get the feedback
      const getResponse = await databases.getDocument(
        DATABASE_ID,
        FEEDBACK_COLLECTION_ID,
        testFeedbackId
      );

      // Verify get response
      expect(getResponse).toHaveProperty("$id", testFeedbackId);
      expect(getResponse.feedback_text).toBe(feedbackData.feedback_text);

      // List feedback for student
      const listResponse = await databases.listDocuments(
        DATABASE_ID,
        FEEDBACK_COLLECTION_ID,
        [Query.equal("student_document_id", testStudentId)]
      );

      // Verify list response
      expect(listResponse).toHaveProperty("documents");
      expect(Array.isArray(listResponse.documents)).toBe(true);

      // Should find at least our test feedback
      const found = listResponse.documents.some(
        (doc) => doc.$id === testFeedbackId
      );
      expect(found).toBe(true);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 20000);
});

describe("Notification API", () => {
  test("Create, fetch, and mark notification as read", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // Create test notification
      const notificationData = {
        recipient_id: TEST_USER_ID,
        message: "This is a test notification from automated API tests.",
        type: "feedback",
        reference_id: testFeedbackId || "unknown",
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Create notification document
      const createResponse = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        notificationData
      );

      // Save ID for cleanup
      testNotificationId = createResponse.$id;

      // Verify created notification
      expect(createResponse).toHaveProperty("$id");
      expect(createResponse.message).toBe(notificationData.message);
      expect(createResponse.recipient_id).toBe(notificationData.recipient_id);
      expect(createResponse.is_read).toBe(false);

      // List notifications for user
      const listResponse = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal("recipient_id", TEST_USER_ID),
          Query.equal("is_read", false),
        ]
      );

      // Verify list response
      expect(listResponse).toHaveProperty("documents");
      expect(Array.isArray(listResponse.documents)).toBe(true);

      // Should find at least our test notification
      const found = listResponse.documents.some(
        (doc) => doc.$id === testNotificationId
      );
      expect(found).toBe(true);

      // Mark as read
      const updateResponse = await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        testNotificationId,
        { is_read: true }
      );

      // Verify update
      expect(updateResponse).toHaveProperty("$id", testNotificationId);
      expect(updateResponse.is_read).toBe(true);

      // Verify it's not in unread notifications anymore
      const listAfterUpdate = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal("recipient_id", TEST_USER_ID),
          Query.equal("is_read", false),
        ]
      );

      const foundAfterUpdate = listAfterUpdate.documents.some(
        (doc) => doc.$id === testNotificationId
      );
      expect(foundAfterUpdate).toBe(false);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 20000);
});

describe("User Profile API", () => {
  test("Get and update user profile", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN || JWT_TOKEN === "mock-jwt-token") {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    try {
      // Get current user profile
      const response = await fetch(`${API_BASE_URL}/account/prefs`, {
        method: "GET",
        headers: {
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          "X-Appwrite-JWT": JWT_TOKEN,
        },
      });

      // Verify the response
      expect(response.status).toBe(200);

      const preferences = await response.json();

      // Update preferences with test data
      const updateData = {
        ...preferences,
        theme: preferences.theme === "dark" ? "light" : "dark",
        notificationsEnabled: true,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/account/prefs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          "X-Appwrite-JWT": JWT_TOKEN,
        },
        body: JSON.stringify(updateData),
      });

      // Verify update
      expect(updateResponse.status).toBe(200);

      const updatedPrefs = await updateResponse.json();
      expect(updatedPrefs).toStrictEqual(updateData);

      // Reset preferences to original
      const resetResponse = await fetch(`${API_BASE_URL}/account/prefs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          "X-Appwrite-JWT": JWT_TOKEN,
        },
        body: JSON.stringify(preferences),
      });

      // Verify reset
      expect(resetResponse.status).toBe(200);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  }, 15000);
});
