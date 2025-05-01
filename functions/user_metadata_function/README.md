# `user_metadata_function` — Appwrite Function (Stable)

> ✅ Stable Release  
> This function handles user metadata and profile management for newly registered users.

Frontend developers can refer to this document to implement user-related logic accordingly.

------

### 🔮 Potential Future Enhancements

- 📤 Integration with avatar display across platform
- 🔁 Validation of metadata completeness on login

------

### 🔐 Environment Variable Handling

All environment variables (e.g. `APPWRITE_API_KEY`, `DB_ID`, `PROJECT_ID`, bucket IDs) are securely stored in Appwrite **Function Settings → Environment Variables**. They are **not exposed in source code or version control**, and injected at runtime by Appwrite.

If you need to update or add an environment variable:

- Go to **Appwrite Console → Settings → Global variables**
- Add or update the key/value
- Click **Update** to trigger a rebuild

> ⚠️ Never hardcode sensitive values like `API keys`, `JWTs`, or `collection IDs` into frontend or Git-tracked code.

------

## 🔍 Locating the Function in Appwrite Console

You can find and manage the `user_metadata_function` function directly within the **Appwrite Console**:

- Navigate to: **Functions → user_metadata_function**

------

## 🚀 How to Call `user_metadata_function`

This function should be called using Appwrite's `createExecution()` method.

### 📦 Request Template

```js
await functions.createExecution('user_metadata_function', JSON.stringify({
  jwt: 'your-jwt-token',
  action: 'yourActionName',
  payload: {
    // Optional: pass any relevant data here
  }
}));
```

------

## 📚 Function actions

This function handles all user-metadata-related actions via JWT-authenticated calls. Below is a reference guide for each supported `action`.

------

### 🆕 `addMetadata`

**Description**: Creates or updates a user's metadata record based on their unique `$id`.

**Who Can Use**: Any authenticated user

**Payload Example**:

```json
{
  "first_name": "Alice",
  "last_name": "Smith",
  "email": "alice@example.com",
  "role": "preceptor",
  "affiliation_id": "aff123",
  "nmba_confirmed": true
}
```

**Behavior**:

- Checks if metadata already exists
- If it does, updates the document
- Otherwise, creates a new document using the user's `$id`

------

### 🔍 `getUserRole`

**Description**: Retrieves the current user's stored metadata and assigned role.

**Who Can Use**: Any authenticated user

**Behavior**:

- Fetches document using user's `$id`
- Returns metadata for role-based logic on frontend

------

### 📤 `uploadAvatar`

**Description**: Uploads a file (e.g. profile image) to Appwrite Storage using user's `$id`.

**Who Can Use**: Any authenticated user

**Payload**:

```json
{
  "file": <File> // File object in Appwrite-compatible format
}
```

**Behavior**:

- Uploads file to `STORAGE_BUCKET_ID` bucket
- Uses user's `$id` as file ID to simplify future referencing

> ⚠️ File upload testing is easiest via frontend, not Postman

------

## 📦 Response Format (All Actions)

Appwrite functions return a consistent wrapper object from `functions.createExecution(...)`.  
The actual result is inside the `responseBody` field and must be parsed from JSON.

------

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
  "message": "Detailed error message here."
}
```

### 📌 Full Execution Wrapper (From Appwrite)

```json
{
  "$id": "abc123",
  "functionId": "user_metadata_function",
  "status": "completed",
  "responseStatusCode": 200,
  "responseBody": "{"status":"success","data":{...}}"
}
```

> 📌 In frontend, always parse `response.responseBody` using `JSON.parse(...)` to access `status`, `data`, and `message`. For example:

```js
const res = await functions.createExecution('user_metadata_function', JSON.stringify({...}));
const data = JSON.parse(res.responseBody);
```