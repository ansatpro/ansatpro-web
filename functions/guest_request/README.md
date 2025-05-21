# `guest_request` — Appwrite Function (Stable)

> ✅ **Stable Release**  
> This function provides **public, read-only access** to certain static datasets such as affiliations, clinic areas, and assessment standards.

This function does **not require authentication**, making it suitable for public-facing forms and dropdowns.



---

### 🔐 Environment Variable Handling

All environment variables (e.g. `APPWRITE_ENDPOINT`, `DB_ID`, `PROJECT_ID`, collection IDs) are securely stored in Appwrite **Function Settings → Environment Variables**.

If you need to update or add an environment variable:

- Go to **Appwrite Console → Settings → Global variables**
- Add or update the key/value
- Click **Update** to trigger a rebuild

> ⚠️ Never hardcode sensitive values into source code.



---

## 🔍 Locating the Function in Appwrite Console

You can find and manage the `public_readonly_data` function directly within the **Appwrite Console**:

- Navigate to: **Functions → public_readonly_data**



---

## 🚀 How to Call `guest_request`

This function should be called using Appwrite's `createExecution()` method.

### 📦 Request Template

```js
await functions.createExecution('public_readonly_data', JSON.stringify({
  action: 'yourActionName'
}));
```

### 🛠 Request Example

```js
await functions.createExecution('public_readonly_data', JSON.stringify({
  action: 'getAffiliations'
}));
```

> ⚠️ Here `public_readonly_data` is the function ID.



---

## 📚 Function actions

This function handles simple read-only actions. Below is a guide for each supported `action`.

------

### 🏛️ `getAffiliations`

**Description**: Fetches the list of available affiliations (universities or health services).

**Who Can Use**: Public (No authentication required)

**Behavior**:

- Retrieves all documents from the `affiliations` collection.



------

### 🏥 `getClinicAreas`

**Description**: Fetches the list of available clinic areas.

**Who Can Use**: Public (No authentication required)

**Behavior**:

- Retrieves all documents from the `clinic_areas` collection.



------

### 📚 `getAssessmentItems`

**Description**: Fetches the list of nursing assessment standard items.

**Who Can Use**: Public (No authentication required)

**Behavior**:

- Retrieves all documents from the `assessment_items` collection.



------

## 📦 Response Format (All Actions)

The function returns a consistent wrapper object containing the requested data.

---

### ✅ On Success

```json
{
  "affiliations": [
    {
      "$id": "aff1",
      "name": "University of Health"
    },
    ...
  ]
}
```

or

```json
{
  "clinicAreas": [...]
}
```

or

```json
{
  "standardItems": [...]
}
```



### ❌ On Error

```json
{
  "status": "error",
  "message": "Unknown action"
}
```

or in case of server failure:

```json
{
  "error": "Unable to fetch data"
}
```

> 📌 In frontend, always handle both `success` and `error` cases gracefully.