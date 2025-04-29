# `preceptor_related` — Appwrite Function (Stable)

> ✅ **Stable Release**  
> This function handles **preceptor-specific workflows**, including AI-powered feedback analysis and student feedback management.

Frontend developers can refer to this document to implement the required logic accordingly.



---

### 🔮 Potential Future Enhancements

- 🧠 Integration with facilitator review workflows
- 🔁 Refactoring student metadata linkage



---

### 🔐 Environment Variable Handling

All environment variables (e.g. `APPWRITE_API_KEY`, `DB_ID`, `PROJECT_ID`, function ids) are securely stored in Appwrite **Function Settings → Environment Variables**. They are **not exposed in source code or version control**, and injected at runtime by Appwrite.

If you need to update or add an environment variable:

- Go to **Appwrite Console → Settings → Global variables**
- Add or update the key/value
- Click **Update** to trigger a rebuild

> ⚠️ Never hardcode sensitive values like `API keys`, `JWTs`, or `collection IDs` into frontend or Git-tracked code.



---

## 🔍 Locating the Function in Appwrite Console

You can find and manage the `preceptor_related` function directly within the **Appwrite Console**:

- Navigate to: **Functions → preceptor_related**

  



---

## 🚀 How to Call `preceptor_related`

This function should be called using Appwrite's `createExecution()` method.

### 📦 Request Template

```js
await functions.createExecution('preceptor_related', JSON.stringify({
  jwt: 'your-jwt-token',
  action: 'yourActionName',
  payload: {
    // Optional: pass any relevant data here
  }
}));
```

### 🛠 Request Example

```js
await functions.createExecution('PRECEPTOR_RELATED_FUNCTION_ID', JSON.stringify({
  jwt,
  action: 'addPreceptorFeedback',
  payload: {
    student_document_id: 'doc123',
    content: 'Shows initiative and communicates clearly',
    discussion_date: '2025-04-20',
    flag_discussed_with_student: true,
    flag_discuss_with_facilitator: true,
    ai_item_list: {
      "2.1": true,
      "3.4": false
    }
  }
}));
```

> ⚠️ Here `PRECEPTOR_RELATED_FUNCTION_ID` is the function ID.



---

## 📚 Function actions

This function handles all role-based actions via JWT-authenticated calls. Below is a reference guide for each supported `action`.



------

### 🔁 `getPreceptorFeedbackWithStudent`

**Description**: Retrieves feedback written by the preceptor, with student and AI assessment info embedded.

**Who Can Use**: `preceptor`

**Behavior**:

- Filters `preceptor_feedbacks` by `preceptor_id`
- Joins corresponding student from `students` collection
- Fetches AI item links and joins descriptions from `assessment_items`

> ⚠️ This action doesn't need a payload



------

### 📝 `addPreceptorFeedback`

**Description**: Allows a preceptor to submit feedback for a student, with optional facilitator flag and AI-linked items.

**Who Can Use**: `preceptor`

**Payload Example**:

```json
{
  "student_document_id": "doc123",
  "content": "Student actively participates in clinical rounds.",
  "discussion_date": "2025-04-22",
  "flag_discussed_with_student": true,
  "flag_discuss_with_facilitator": false,
  "ai_item_list": {
    "1.4": true,
    "3.1": false
  }
}
```

**Behavior**:

- Creates a new feedback document
- Inserts multiple AI items referencing the feedback
- If flagged, creates a notification for the student’s facilitator



------

### 🔍 `searchStudents`

**Description**: Searches students using fuzzy match on lowercase full name.

**Who Can Use**: `preceptor`

**Payload Example**:

```json
{
  "query": "ali"
}
```

**Behavior**:

- Case-insensitive `startsWith` search on `full_name_lower`
- Returns up to 10 results

> ⚠️ This action is optimized for client-side debounced search (e.g., 500ms delay)



------

### 🤖 `getAiFeedbackPreceptor`

**Description**: Uses Groq AI to analyze written feedback and suggest matching nursing standards.

**Who Can Use**: `preceptor`

**Payload Example**:

```json
{
  "text": "Student is proficient in time management and prioritizes care tasks."
}
```

**Behavior**:

- Loads standard assessment items from DB
- Sends prompt to Groq API for classification
- Returns array of `matched_ids`



------

## 📦 Response Format (All Actions)

Appwrite functions return a consistent wrapper object from `functions.createExecution(...)`.  
The actual result is inside the `responseBody` field and must be parsed from JSON.



---

### ✅ On Success

```json
{
  "status": "success",
  "data": {
    // Varies by action
  }
}
```

### ❌ On Error

```json
{
  "status": "error",
  "message": "Only preceptors are allowed to perform this action."
}
```

### 📌 Full Execution Wrapper (From Appwrite)

```json
{
  "$id": "abc123",
  "functionId": "preceptor_related",
  "status": "completed",
  "responseStatusCode": 200,
  "responseBody": "{\"status\":\"success\",\"data\":{...}}"
}
```

> 📌 In frontend, always parse `response.responseBody` using `JSON.parse(...)` to access `status`, `data`, and `message`. For example:

```js
const res = await functions.createExecution('preceptor_related', JSON.stringify({...}));
const data = JSON.parse(res.responseBody);
```