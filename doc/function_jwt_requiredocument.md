#  `function_jwt_require` — Appwrite Function (Beta)



> ⚠️ **Beta Notice**  
> This function is currently in **beta** and may be updated or partially removed at any time.  
> The documentation will be kept in sync with any changes made.



### ✅ Current Functionality

This function currently supports:

- ✅ All **preceptor-related workflows** (excluding AI features)
- ✅ **Facilitator** functionality for student registration

Frontend developers can refer to this document to implement the required logic accordingly.

---



### 🔮 Potential Future Changes

- 🧠 Integration of AI-powered feedback generation

- 🔁 Replacement or refactoring of the current Function ID

  

### 🔐 Environment Variable Handling

All environment variables (e.g. `APPWRITE_API_KEY`, `DB_ID`, `PROJECT_ID`, function ids) are securely stored in Appwrite **Function Settings → Environment Variables**. They are **not exposed in source code or version control**, and injected at runtime by Appwrite.

If you need to update or add an environment variable:

- Go to **Appwrite Console → Settings → Global variables**

  ![1744535920274](C:\Users\Lenovo\AppData\Roaming\Typora\typora-user-images\1744535920274.png)

- Add or update the key/value

- Click **Update** to trigger a rebuild

> ⚠️ Never hardcode sensitive values like `API keys`, `JWTs`, or `collection IDs` into frontend or Git-tracked code.



## 🔍 Locating the Function in Appwrite Console

You can find and manage the `function_jwt_require` function directly within the **Appwrite Console**:

- Navigate to: **Functions → function_jwt_require**

  ![1744536603141](C:\Users\Lenovo\AppData\Roaming\Typora\typora-user-images\1744536603141.png)

  

## 🚀 How to Call `function_jwt_require`

This function should be called using Appwrite's `createExecution()` method.

### 📦 Request Template

```js
await functions.createExecution('function_jwt_require', JSON.stringify({
  jwt: 'your-jwt-token',
  action: 'yourActionName',
  payload: {
    // Optional: pass any relevant data here
  }
}));
```



### 🛠 Request Example

```js
await functions.createExecution('function_jwt_require', JSON.stringify({
  jwt,
  action: 'addStudentByFacilitator',
  payload: {
    student_id: 'stu123',
    first_name: 'Jane',
    last_name: 'Doe',
    university_id: 'uni001',
    health_service_id: 'hs001',
    clinic_area_id: 'clinicA',
    start_date: '2025-04-15',
    end_date: '2025-05-30',
    additional_facilitator_id: 'user789',
    full_name_lower: 'jane doe'
  }
}));
```



> ⚠️ Here `function_jwt_require` is the function ID .





## 📚 Function actions

This function handles all role-based actions via JWT-authenticated calls. Below is a reference guide for each supported `action`.

------

### 👤 `addStudentByFacilitator`

**Description**: Allows a facilitator to add a new student. Automatically sets `created_by` to the facilitator’s user ID.

**Who Can Use**: `facilitator`

**Payload Example**:

```json
{
  "student_id": "stu123",
  "first_name": "Jane",
  "last_name": "Doe",
  "university_id": "uni001",
  "health_service_id": "hs001",
  "clinic_area_id": "clinicA",
  "start_date": "2025-04-15",
  "end_date": "2025-05-30",
  "additional_facilitator_id": "user789",
  "full_name_lower": "jane doe"
}
```

**Behavior**:

- Adds `created_by: user.$id`
- Creates a new document in `students` collection

> ⚠️ I add a new attribute in the students table: full_name_lower, which is used for fuzzy search. You should add it manually from frontend. Make sure it is lowercase.
>
> The format of it is (first_name + last_name).to lowercase.



------

### 🔁 `getPreceptorFeedbackWithStudent`

**Description**: Retrieves feedback written by the preceptor, with student info embedded for each entry.

**Who Can Use**: `preceptor`

**Behavior**:

- Filters `preceptor_feedbacks` by `preceptor_id`
- For each feedback, fetches corresponding student by `student_id`
- Returns the information include both students and their related feedbacks

> ⚠️ This action doesn't need a payload



------

### 📝 `addPreceptorFeedback`

**Description**: Allows a preceptor to submit feedback for a student.

**Who Can Use**: `preceptor`

**Payload Example**:

```json
{
  "student_id": "stu123",
  "content": "Shows good clinical reasoning",
  "discussion_date": "2025-04-10",
  "flag_discussed_with_student": true,
  "flag_discuss_with_facilitator": false
}
```

**Behavior**:

- Automatically assigns `preceptor_id: user.$id`
- Creates a document in `preceptor_feedbacks` collection



------

### 🔍 `searchStudents`

**Description**: Searches students by partial match of `full_name_lower`. Supports role-based filtering.

**Who Can Use**: `preceptor`, `facilitator`

**Payload Example**:

```json
{
  "query": "ali"
}
```

**Behavior**:

- Case-insensitive `startsWith` match on `full_name_lower`
- Facilitators only see students they created (`created_by`)
- Returns top 10 matches

> ⚠️ This action doesn't need a payload.
>
> It is **strongly recommended** that the frontend implements a **debounced search** (e.g., wait for 500ms–1000ms after user stops typing) to reduce redundant requests. 
>
> For example, use `lodash.debounce` or `setTimeout` with `useEffect` in React to delay the function call after the user stops typing in the search bar.



------

### 📋 `getStudentsList`

**Description**: Returns all student documents.

**Who Can Use**:

- `preceptor`: full access
- `facilitator`: filtered to only their created students

**Behavior**:

- Role checked using `users_metadata`
- Facilitator: `Query.equal('created_by', user.$id)`
- Preceptor: unrestricted



------

### 📌 `addMetadata`

**Description**: Adds extended user profile info after registration.

**Who Can Use**: All authenticated users immediately after account creation.

**Payload Example**:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "role": "facilitator",
  "email": "john@example.com",
  "affiliation_id": "uni002",
  "nmba_confirmed": true
}
```

**Behavior**:

- Creates a new document in `users_metadata` collection with the user ID
- Used to drive role-based permissions in all other actions



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

```
{
  "status": "error",
  "message": "Only preceptors can access this feedback."
}
```



### 📌 Full Execution Wrapper (From Appwrite)

The full response from `createExecution()` contains execution metadata and a JSON string as the actual result:

```
{
  "$id": "67fb8b9564cdb07ba305",
  "functionId": "function_jwt_require",
  "status": "completed",
  "responseStatusCode": 200,
  "responseBody": "{\"status\":\"success\",\"data\":{...}}",
  ...
}
```

> 📌 In frontend, always parse `response.responseBody` using `JSON.parse(...)` to access `status`, `data`, and `message`. For example:
>
> ```js
> const res = await functions.createExecution(
>     'function_jwt_require',
>     JSON.stringify({
>         jwt: jwtToken,
>         action: 'searchStudents',
>         payload: { query: value }
>     })
> );
> 
> const data = JSON.parse(res.responseBody);
> ```
>
> 



