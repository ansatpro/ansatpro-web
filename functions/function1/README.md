# ANSAT Pro API and Frontend Function Documentation

## 1. Backend API Documentation

This section documents the 12 API endpoints implemented in the Appwrite function for the ANSAT Pro platform. Each endpoint is accessible via Appwrite’s Functions service and requires proper authentication and environment variable configuration.

### Environment Variables
The following environment variables must be configured:
- `project_API_key`: Appwrite project API key.
- `APPWRITE_FUNCTION_API_ENDPOINT`: Appwrite API endpoint (e.g., `https://cloud.appwrite.io/v1`).
- `APPWRITE_FUNCTION_PROJECT_ID`: Appwrite project ID.
- `db_id`: Database ID for Appwrite collections.
- `email_verification_tokens`: Collection ID for email verification tokens.
- `collection_id_students`: Collection ID for student records.
- `notifications`: Collection ID for notifications.
- `preceptor_feedbacks`: Collection ID for preceptor feedback.
- `preceptor_ai_feedback_items`: Collection ID for AI-generated feedback items.
- `assessment_items`: Collection ID for assessment items.
- `facilitator_reviews`: Collection ID for facilitator reviews.
- `facilitator_review_scores`: Collection ID for facilitator review scores.
- `GROQ_API_KEY`: API key for Groq AI service.
- `NEXT_PUBLIC_BASE_URL`: Base URL for verification links (e.g., `https://ansatpro.com`).
- `NEXT_PUBLIC_MAILERSEND_API_KEY`: MailerSend API key for email sending.

### Endpoints

#### 1.1 /ping
- **Method**: GET
- **Path**: `/ping`
- **Description**: Tests connectivity to the Appwrite function, returning a simple response to confirm the function is operational.
- **Request**:
  - **Body**: None
  - **Headers**: None
- **Response**:
  - **Success (200)**: Plain text `"Pong"`
  - **Errors**: None (minimal error handling)
- **Example**:
  ```bash
  curl -X GET <function-url>/ping
  ```
  Response: `Pong`
- **Usage**: Used for health checks or debugging to verify function accessibility.

#### 1.2 /auth/email/send-verification
- **Method**: POST
- **Path**: `/auth/email/send-verification`
- **Description**: Sends an email verification link to a user by generating a unique token and storing it in the database.
- **Request**:
  - **Body**: JSON `{ "email": string, "userId": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "success": true, "message": "Verification email sent successfully" }`
  - **Errors**:
    - **400**: `{ "success": false, "message": "Email and userId are required" }` (missing inputs)
    - **500**: `{ "success": false, "message": "Failed to send verification email" }` (email sending failure)
    - **500**: `{ "success": false, "message": "Internal server error" }` (general errors)
- **Example**:
  ```bash
  curl -X POST <function-url>/auth/email/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "userId": "12345"}'
  ```
  Response: `{ "success": true, "message": "Verification email sent successfully" }`
- **Usage**: Initiates email verification during user registration.

#### 1.3 /auth/email/verify
- **Method**: POST
- **Path**: `/auth/email/verify`
- **Description**: Verifies a user’s email by validating a token and updating their verification status.
- **Request**:
  - **Body**: JSON `{ "token": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "success": true, "message": "Email verified successfully" }`
  - **Errors**:
    - **400**: `{ "success": false, "message": "Token is required" }` (missing token)
    - **400**: `{ "success": false, "message": "Invalid or expired token" }` (invalid token)
    - **500**: `{ "success": false, "message": "Internal server error" }` (general errors)
- **Example**:
  ```bash
  curl -X POST <function-url>/auth/email/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123xyz"}'
  ```
  Response: `{ "success": true, "message": "Email verified successfully" }`
- **Usage**: Completes email verification when a user clicks the verification link.

#### 1.4 /facilitator/create/student
- **Method**: POST
- **Path**: `/facilitator/create/student`
- **Description**: Creates a new student record in the database.
- **Request**:
  - **Body**: JSON `{ "student_id": string, "first_name": string, "last_name": string, "university_id": string, "health_service_id": string, "clinic_area_id": string, "start_date": string, "end_date": string, "additional_facilitator_id": string, "created_by": string, "full_name_lower": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "message": "Student created", "id": string }`
  - **Errors**: `{ "message": "Unknown method" }` (non-POST requests)
- **Example**:
  ```bash
  curl -X POST <function-url>/facilitator/create/student \
  -H "Content-Type: application/json" \
  -d '{"student_id": "123", "first_name": "John", "last_name": "Doe", "university_id": "uni1", "health_service_id": "hs1", "clinic_area_id": "ca1", "start_date": "2025-01-01", "end_date": "2025-06-01", "additional_facilitator_id": "fac2", "created_by": "user1", "full_name_lower": "john doe"}'
  ```
  Response: `{ "message": "Student created", "id": "123" }`
- **Usage**: Facilitators add new students for tracking and feedback.

#### 1.5 /facilitator/get/notifications
- **Method**: GET
- **Path**: `/facilitator/get/notifications`
- **Description**: Retrieves all notifications for a specific recipient with pagination.
- **Request**:
  - **Body**: JSON `{ "recipient_id": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: Array of notification objects (e.g., `{ $id: string, recipient_id: string, message: string, is_read: boolean, $createdAt: string }`)
  - **Errors**: `{ "message": "Unknown method" }` (non-GET requests)
- **Example**:
  ```bash
  curl -X GET <function-url>/facilitator/get/notifications \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": "user1"}'
  ```
  Response: `[{ "$id": "notif1", "recipient_id": "user1", "message": "New feedback", "is_read": false, "$createdAt": "2025-01-01T10:00:00Z" }]`
- **Usage**: Facilitators view their notifications.

#### 1.6 /facilitator/get/students
- **Method**: GET
- **Path**: `/facilitator/get/students`
- **Description**: Fetches all students created by a specific facilitator with pagination.
- **Request**:
  - **Body**: JSON `{ "created_by": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: Array of student objects (e.g., `{ $id: string, student_id: string, first_name: string, last_name: string, ... }`)
  - **Errors**: `{ "message": "Unknown method" }` (non-GET requests)
- **Example**:
  ```bash
  curl -X GET <function-url>/facilitator/get/students \
  -H "Content-Type: application/json" \
  -d '{"created_by": "user1"}'
  ```
  Response: `[{ "$id": "student1", "student_id": "123", "first_name": "John", "last_name": "Doe", ... }]`
- **Usage**: Facilitators list their managed students.

#### 1.7 /facilitator/student/studentList
- **Method**: DELETE
- **Path**: `/facilitator/student/studentList`
- **Description**: Deletes a student record by document ID.
- **Request**:
  - **Body**: JSON `{ "documentID": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "message": "Delete successfully", "response": object }`
  - **Errors**:
    - **500**: `{ "message": "Failed to delete", "error": object }` (deletion errors)
    - **405**: `{ "message": "Method Not Allowed" }` (non-DELETE requests)
- **Example**:
  ```bash
  curl -X DELETE <function-url>/facilitator/student/studentList \
  -H "Content-Type: application/json" \
  -d '{"documentID": "student1"}'
  ```
  Response: `{ "message": "Delete successfully", "response": {} }`
- **Usage**: Facilitators remove outdated student records.

#### 1.8 /facilitator/get/studentsWithAllDetails
- **Method**: GET
- **Path**: `/facilitator/get/studentsWithAllDetails`
- **Description**: Retrieves all students created by a facilitator with detailed feedback, reviews, scores, and preceptor details, using pagination.
- **Request**:
  - **Body**: JSON `{ "created_by": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: Array of student objects with `preceptorFeedbackList` (e.g., `{ $id: string, first_name: string, preceptorFeedbackList: [{ $id: string, preceptor_name: string, ai_feedback_items: array, review: object }] }`)
  - **Empty (200)**: `[]` (no students found)
- **Example**:
  ```bash
  curl -X GET <function-url>/facilitator/get/studentsWithAllDetails \
  -H "Content-Type: application/json" \
  -d '{"created_by": "user1"}'
  ```
  Response: `[{ "$id": "student1", "first_name": "John", "preceptorFeedbackList": [{ "$id": "feedback1", "preceptor_name": "Jane", ... }] }]`
- **Usage**: Facilitators access detailed student performance data.

#### 1.9 /facilitator/post/studentReview
- **Method**: POST
- **Path**: `/facilitator/post/studentReview`
- **Description**: Submits facilitator reviews with comments and rated items.
- **Request**:
  - **Body**: JSON `{ "preceptor_feedback_document_id": string, "facilitator_id": string, "comment": string, "flag_discussed_with_student": boolean, "discussion_date": string, "ratedItems": [{ "itemId": string, "rating": string }] }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "message": "Post comment successfully" }`
  - **Errors**: `{ "message": "Failed to post", "error": object }` (server errors)
- **Example**:
  ```bash
  curl -X POST <function-url>/facilitator/post/studentReview \
  -H "Content-Type: application/json" \
  -d '{"preceptor_feedback_document_id": "feedback1", "facilitator_id": "user1", "comment": "Great work", "flag_discussed_with_student": true, "discussion_date": "2025-01-01", "ratedItems": [{ "itemId": "item1", "rating": "5" }]}'
  ```
  Response: `{ "message": "Post comment successfully" }`
- **Usage**: Facilitators provide feedback on student performance.

#### 1.10 /facilitator/notification/put
- **Method**: PUT
- **Path**: `/facilitator/notification/put`
- **Description**: Updates a notification’s status to "read" by document ID.
- **Request**:
  - **Body**: JSON `{ "doc_id": string }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "message": "update successfully" }`
  - **Errors**: Implicit Appwrite errors (e.g., invalid `doc_id`)
- **Example**:
  ```bash
  curl -X PUT <function-url>/facilitator/notification/put \
  -H "Content-Type: application/json" \
  -d '{"doc_id": "notif1"}'
  ```
  Response: `{ "message": "update successfully" }`
- **Usage**: Facilitators mark notifications as read.

#### 1.11 /facilitator/AIsummary
- **Method**: POST
- **Path**: `/facilitator/AIsummary`
- **Description**: Generates an AI-based performance summary using feedback data via the Groq API.
- **Request**:
  - **Body**: JSON `{ "prompt": [{ "content": string, "reviewComment": string, "reviewScore": [{ "description": string, "score": string }] }] }`
  - **Headers**: `Content-Type: application/json`
- **Response**:
  - **Success (200)**: `{ "message": "Generate AI Summary Successfully", "aiAnswer": string }`
  - **Errors**: `{ "error": string }` (Groq API errors)
- **Example**:
  ```bash
  curl -X POST <function-url>/facilitator/AIsummary \
  -H "Content-Type: application/json" \
  -d '{"prompt": [{ "content": "Good performance", "reviewComment": "Keep it up", "reviewScore": [{ "description": "Skill", "score": "5" }] }]}'
  ```
  Response: `{ "message": "Generate AI Summary Successfully", "aiAnswer": "- Key Strengths: Strong skills..." }`
- **Usage**: Facilitators generate summarized feedback insights.

#### 1.12 /admin/verifyAllUsers
- **Method**: PUT
- **Path**: `/admin/verifyAllUsers`
- **Description**: Verifies all users by updating their email verification status.
- **Request**:
  - **Body**: None
  - **Headers**: None
- **Response**:
  - **Success (200)**: `{ "message": "All ${number} users have been verified." }`
  - **Errors**: Implicit Appwrite errors
- **Example**:
  ```bash
  curl -X PUT <function-url>/admin/verifyAllUsers
  ```
  Response: `{ "message": "All 50 users have been verified." }`
- **Usage**: Admins bulk-verify user accounts.

## 2. Frontend Function Documentation

This section documents the 10 frontend components/functions in the ANSAT Pro frontend module, which interact with the backend API endpoints using Appwrite’s Functions service. These functions are designed for use in a React application.

### Dependencies
- **Appwrite SDK**: `appwrite` (for `ExecutionMethod`, `functions`, `account`)
- **React**: `react` (for `useState` in the test component)
- **Configuration**: `FUNCTION1_ID` (Appwrite function ID), `functions`, `account` from `appwrite.js`

### Components/Functions

#### 2.1 HowToConnectTofunction
- **Type**: React Component
- **Endpoint**: `/ping` (GET)
- **Description**: A test component that renders a button to trigger the `/ping` endpoint, displaying the response ("pong") to verify connectivity.
- **Usage**:
  - Import and render in a React application.
  - Clicking the button calls the endpoint and shows the response.
- **Input**: None (user interaction via button click).
- **Output**:
  - Renders a UI with a message, button, and response (e.g., `"Pong"`).
  - Success: Displays the response body as JSON.
  - Failure: Implicit Appwrite errors (not displayed).
- **Example**:
  ```jsx
  import HowToConnectTofunction from './functions';
  <HowToConnectTofunction />
  ```
  UI Output: Button with text "click me!" and response `"Pong"` on click.
- **Error Handling**: None explicit; relies on Appwrite’s error handling.
- **Use Case**: Developers test Appwrite function connectivity during development.

#### 2.2 CreateStudent
- **Type**: Async Function
- **Endpoint**: `/facilitator/create/student` (POST)
- **Description**: Creates a student record by mapping form data and sending it to the backend.
- **Usage**:
  - Call with form data from a student creation form.
  - Handle the returned promise for success/error feedback.
- **Input**:
  - `formData`: Object `{ studentId: string, firstName: string, lastName: string, university: string, healthService: string, clinicArea: string, startDate: string, endDate: string, additionalFacilitator: string }`
- **Output**:
  - **Success**: String `"Student created successfully"`
  - **Error**: Throws `Error("Student creation failed")`
- **Example**:
  ```jsx
  const formData = { studentId: "123", firstName: "John", lastName: "Doe", ... };
  try {
    const result = await CreateStudent(formData);
    console.log(result); // "Student created successfully"
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Facilitators submit student creation forms.

#### 2.3 GetAllNotifications
- **Type**: Async Function
- **Endpoint**: `/facilitator/get/notifications` (GET)
- **Description**: Retrieves and formats notifications for the current user.
- **Usage**:
  - Call to fetch notifications for display in a notification UI.
  - Handle the returned array for rendering.
- **Input**: None (uses current user’s ID).
- **Output**:
  - **Success**: Array of objects `{ documentID: string, messageTime: string, facilitator_id: string, message: string, is_read: boolean }`
  - **Error**: Throws `Error("Student fetching failed")`
- **Example**:
  ```jsx
  try {
    const notifications = await GetAllNotifications();
    console.log(notifications); // [{ documentID: "notif1", messageTime: "2025-01-01T10:00:00Z", ... }]
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Displays notifications in the frontend.

#### 2.4 UpdateNotification
- **Type**: Async Function
- **Endpoint**: `/facilitator/notification/put` (PUT)
- **Description**: Marks a notification as "read" by document ID.
- **Usage**:
  - Call with a notification’s `doc_id` when marking it as read.
  - Handle the returned response for UI updates.
- **Input**:
  - `doc_id`: String (notification document ID).
- **Output**:
  - **Success**: Object `{ message: "update successfully" }`
  - **Error**: Throws `Error("update failed")`
- **Example**:
  ```jsx
  try {
    const result = await UpdateNotification("notif1");
    console.log(result); // { message: "update successfully" }
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Facilitators mark notifications as read.

#### 2.5 GetAllStudents
- **Type**: Async Function
- **Endpoint**: `/facilitator/get/students` (GET)
- **Description**: Fetches and formats all students created by the current user.
- **Usage**:
  - Call to retrieve student data for display in a list.
  - Handle the returned array for rendering.
- **Input**: None (uses current user’s ID).
- **Output**:
  - **Success**: Array of objects `{ documentID: string, firstName: string, lastName: string, studentId: string, university: string, healthService: string, clinicArea: string, additionalFacilitator: string, startDate: string, endDate: string }`
  - **Error**: Throws `Error("Student fetching failed")`
- **Example**:
  ```jsx
  try {
    const students = await GetAllStudents();
    console.log(students); // [{ documentID: "student1", firstName: "John", ... }]
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Displays a list of managed students.

#### 2.6 DeleteStudent
- **Type**: Async Function
- **Endpoint**: `/facilitator/student/studentList` (DELETE)
- **Description**: Deletes a student record by document ID.
- **Usage**:
  - Call with a student’s `documentID` to remove the record.
  - Handle the raw response for confirmation.
- **Input**:
  - `documentID`: String (student document ID).
- **Output**:
  - **Success**: Raw response object (e.g., `{ message: "Delete successfully", response: object }`)
  - **Error**: Implicit Appwrite errors
- **Example**:
  ```jsx
  const result = await DeleteStudent("student1");
  console.log(result); // { message: "Delete successfully", ... }
  ```
- **Error Handling**: None explicit; relies on Appwrite errors.
- **Use Case**: Facilitators remove student records.

#### 2.7 GetAllStudentsWithDetails
- **Type**: Async Function
- **Endpoint**: `/facilitator/get/studentsWithAllDetails` (GET)
- **Description**: Retrieves detailed student data, including feedback and reviews.
- **Usage**:
  - Call to fetch comprehensive student data for analysis.
  - Handle the returned array for rendering.
- **Input**: None (uses current user’s ID).
- **Output**:
  - **Success**: Array of student objects with `preceptorFeedbackList`
  - **Error**: Throws `Error("Student fetching failed")`
- **Example**:
  ```jsx
  try {
    const students = await GetAllStudentsWithDetails();
    console.log(students); // [{ $id: "student1", preceptorFeedbackList: [...] }]
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Facilitators review detailed student performance.

#### 2.8 PostFacilitatorComments
- **Type**: Async Function
- **Endpoint**: `/facilitator/post/studentReview` (POST)
- **Description**: Submits facilitator reviews with comments and rated items.
- **Usage**:
  - Call with review data from a feedback form.
  - Handle the returned response for confirmation.
- **Input**:
  - `submissionData`: Object `{ feedbackId: string, comment: string, discussedWithStudent: string, discussionDate: string, ratedItems: [{ itemId: string, rating: number }]}`
- **Output**:
  - **Success**: Object `{ message: "Post comment successfully" }`
  - **Error**: Throws `Error("Facilitator post student comments failed")`
- **Example**:
  ```jsx
  const submissionData = { feedbackId: "feedback1", comment: "Great work", ... };
  try {
    const result = await PostFacilitatorComments(submissionData);
    console.log(result); // { message: "Post comment successfully" }
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Facilitators submit student feedback.

#### 2.9 AIsummary
- **Type**: Async Function
- **Endpoint**: `/facilitator/AIsummary` (POST)
- **Description**: Requests an AI-generated performance summary from feedback data.
- **Usage**:
  - Call with a feedback prompt array.
  - Handle the returned summary for display.
- **Input**:
  - `prompt`: Array of objects `{ content: string, reviewComment: string, reviewScore: [{ description: string, score: string }]}`
- **Output**:
  - **Success**: Object `{ message: "Generate AI Summary Successfully", aiAnswer: string }`
  - **Error**: Throws `Error("AI Summary failed")`
- **Example**:
  ```jsx
  const prompt = [{ content: "Good performance", reviewComment: "Keep it up", ... }];
  try {
    const result = await AIsummary(prompt);
    console.log(result); // { message: "Generate AI Summary Successfully", aiAnswer: "..." }
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Facilitators generate AI-driven feedback summaries.

#### 2.10 VerifyAllUsers
- **Type**: Async Function
- **Endpoint**: `/admin/verifyAllUsers` (PUT)
- **Description**: Triggers bulk verification of all users.
- **Usage**:
  - Call to verify all user accounts.
  - Handle the returned response for confirmation.
- **Input**: None
- **Output**:
  - **Success**: Object `{ message: "All ${number} users have been verified." }`
  - **Error**: Throws `Error("Verify all users failed")`
- **Example**:
  ```jsx
  try {
    const result = await VerifyAllUsers();
    console.log(result); // { message: "All 50 users have been verified." }
  } catch (error) {
    console.error(error.message);
  }
  ```
- **Error Handling**: Throws an error for non-200 responses.
- **Use Case**: Admins perform bulk user verification.