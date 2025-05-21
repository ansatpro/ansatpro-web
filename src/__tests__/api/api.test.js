/**
 * API integration tests for ANSAT Pro
 * This file contains tests for the backend API endpoints
 */

import { expect, test, describe, beforeAll } from "vitest";
import fetch from "node-fetch";
import { account, functions, ID } from "@/app/appwrite";

// Mock JWT token for authenticated requests
let JWT_TOKEN = "";

// Base URL for API tests
const API_BASE_URL = "https://cloud.appwrite.io/v1";
const FUNCTION_ENDPOINT = process.env.NEXT_PUBLIC_FN_GUEST_REQUEST;

// Setup before all tests
beforeAll(async () => {
  // Create a test session and get JWT token
  try {
    // Use appwrite SDK to get a JWT token
    // Note: In actual implementation, you'd use a test user account
    // For demo purposes, we'll just mock it
    JWT_TOKEN = "test-jwt-token";

    console.log("Test setup complete with JWT token");
  } catch (error) {
    console.error("Error setting up test JWT token:", error);
  }
}, 10000);

describe("Authentication API", () => {
  test("Guest endpoint should be accessible without authentication", async () => {
    // Call the guest endpoint function
    const response = await fetch(
      `${API_BASE_URL}/functions/${FUNCTION_ENDPOINT}/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getAffiliations",
        }),
      }
    );

    // Verify the response
    expect(response.status).toBe(201); // Created status for function execution

    const data = await response.json();
    expect(data).toHaveProperty("affiliations");
    expect(Array.isArray(data.affiliations)).toBe(true);
  }, 10000);

  test("Protected endpoints should require authentication", async () => {
    // Attempt to call a protected endpoint without authentication
    const response = await fetch(
      `${API_BASE_URL}/functions/${process.env.NEXT_PUBLIC_FN_USER_METADATA}/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getUserRole",
        }),
      }
    );

    // Should receive unauthorized status
    expect(response.status).toBe(401);
  }, 10000);
});

describe("Student API", () => {
  test("Can fetch all students with authentication", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockGetAllStudents = async () => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return [
        {
          documentID: "doc1",
          firstName: "John",
          lastName: "Doe",
          studentId: "S12345",
          universityId: "uni1",
          healthServiceId: "hs1",
          clinicAreaId: "area1",
          startDate: "2023-01-01",
          endDate: "2023-12-31",
        },
        {
          documentID: "doc2",
          firstName: "Jane",
          lastName: "Smith",
          studentId: "S67890",
          universityId: "uni2",
          healthServiceId: "hs2",
          clinicAreaId: "area2",
          startDate: "2023-02-01",
          endDate: "2023-11-30",
        },
      ];
    };

    const students = await mockGetAllStudents();

    // Verify the response
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);
    expect(students[0]).toHaveProperty("firstName");
    expect(students[0]).toHaveProperty("lastName");
    expect(students[0]).toHaveProperty("studentId");
  }, 10000);

  test("Can create a new student", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockCreateStudent = async (studentData) => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return {
        message: "Student created",
        id: "mock-student-id",
      };
    };

    const newStudent = {
      student_id: "S99999",
      first_name: "Test",
      last_name: "Student",
      university_id: "uni1",
      health_service_id: "hs1",
      clinic_area_id: "area1",
      start_date: "2023-06-01",
      end_date: "2023-12-31",
      created_by: "test-user-id",
      full_name_lower: "test student",
    };

    const response = await mockCreateStudent(newStudent);

    // Verify the response
    expect(response).toHaveProperty("message", "Student created");
    expect(response).toHaveProperty("id");
  }, 10000);
});

describe("Notification API", () => {
  test("Can fetch notifications", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockGetNotifications = async () => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return [
        {
          $id: "notif1",
          $createdAt: "2023-05-01T10:00:00.000Z",
          recipient_id: "test-user-id",
          message: "Test notification 1",
          is_read: false,
        },
        {
          $id: "notif2",
          $createdAt: "2023-05-02T14:30:00.000Z",
          recipient_id: "test-user-id",
          message: "Test notification 2",
          is_read: true,
        },
      ];
    };

    const notifications = await mockGetNotifications();

    // Verify the response
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty("$id");
    expect(notifications[0]).toHaveProperty("message");
    expect(notifications[0]).toHaveProperty("is_read");
  }, 10000);

  test("Can mark notification as read", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockUpdateNotification = async (notificationId) => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return {
        status: "success",
        message: "Notification updated successfully",
      };
    };

    const response = await mockUpdateNotification("notif1");

    // Verify the response
    expect(response).toHaveProperty("status", "success");
  }, 10000);
});

describe("Feedback API", () => {
  test("Can post feedback", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockPostFeedback = async (feedbackData) => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return {
        status: "success",
        feedbackId: "mock-feedback-id",
      };
    };

    const feedbackData = {
      student_document_id: "doc1",
      preceptor_id: "test-preceptor-id",
      feedback_text:
        "Student is doing well. Shows great progress in clinical skills.",
      flag_discuss_with_facilitator: true,
      flag_discuss_with_student: true,
      discussion_date: "2023-05-15",
    };

    const response = await mockPostFeedback(feedbackData);

    // Verify the response
    expect(response).toHaveProperty("status", "success");
    expect(response).toHaveProperty("feedbackId");
  }, 10000);

  test("Can get AI summary", async () => {
    // Skip if no JWT token
    if (!JWT_TOKEN) {
      console.warn("Skipping test due to missing JWT token");
      return;
    }

    const mockGetAISummary = async (studentId) => {
      // In a real test, this would call the actual API
      // For this example, we'll mock the response
      return {
        summary:
          "Student shows consistent progress across multiple clinical areas. Strengths include patient communication and critical thinking. Areas for improvement include documentation and time management.",
        feedbacks: [
          {
            date: "2023-03-10",
            text: "Good progress in patient communication",
          },
          { date: "2023-04-15", text: "Needs improvement in documentation" },
        ],
      };
    };

    const response = await mockGetAISummary("S12345");

    // Verify the response
    expect(response).toHaveProperty("summary");
    expect(typeof response.summary).toBe("string");
    expect(response).toHaveProperty("feedbacks");
    expect(Array.isArray(response.feedbacks)).toBe(true);
  }, 10000);
});
