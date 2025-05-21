# 📦 Functions — Appwrite Serverless Functions

This directory contains **Serverless Functions** designed for the ANSAT Pro platform, built using **Appwrite Functions**.

> ⚠️ **Important Note**:  
> These functions are stored inside this project repository for development and version control purposes. However, they are **not** executed as part of the local Next.js application.  
> They are **deployed separately** and run **in the Appwrite cloud environment**.

---

## 🚀 What are Appwrite Functions?

- **Serverless Functions** allow you to run backend logic without managing your own servers.
- Hosted and executed within the **Appwrite Cloud** or your self-hosted Appwrite instance.
- Support triggered execution via **HTTP calls**, **scheduled events**, or **Appwrite system events**.
- Enable secure, scalable, and modular backend logic handling.

In this project, Appwrite Functions are primarily used for **user authentication workflows**, **preceptor feedback handling**, **guest requests**, and **data fetching**.



---

## 📚 Available Functions

| Function Name         | Description                                        | Auth Requirement |
|:-------------------------|:---------------------------------------------------|:------------------|
| `preceptor_related`       | Handles preceptor workflows like feedback and AI analysis | JWT Required     |
| `user_metadata_function` | Handles all user's common functions like add avatar, add user information into metadata table... | JWT Required |
| `guest_request` | Handles guest user registration and access requests | No Auth Required |

> More functions may be added as the project evolves.



---

## 🔐 Environment Variable Management

All sensitive configuration, including database IDs, API keys, and project endpoints, are securely managed via **Appwrite Function Settings → Environment Variables**.

**Environment variables are injected during runtime** and are **never hardcoded** in the function source code.



---

## 📦 How to Call a Function (Frontend Example)

You can call an Appwrite Function from the frontend using the Appwrite SDK's `createExecution()` method.

### Request Template

There are two kinds of request method.

1. For the functions of  `preceptor_related`, `user_metadata_function` and `guest_request`. You should use specific action to call the function. 

```js
import { functions } from "@/app/appwrite";

await functions.createExecution('function_id_here', JSON.stringify({
  jwt: 'your-jwt-token-if-required(optional)',
  action: 'specificActionName',
  payload: {
    // Additional data if needed
  }
}));
```

### Response Handling Example

```js
const response = await functions.createExecution('function_id_here', JSON.stringify({...}));
const data = JSON.parse(response.responseBody);

if (data.status === "success") {
  console.log("Result:", data.data);
} else {
  console.error("Error:", data.message);
}
```

> Always parse the `response.responseBody` field because it contains the actual function output as a JSON string.



---

## 🛠 Deployment Notes

- Functions must be **manually deployed** to the Appwrite Console.
- Code updates require re-uploading or re-building inside Appwrite.
- Each function runs in its **own isolated container** managed by Appwrite.

For changes to take effect, always re-deploy after updating the function code.



---

## 🧩 Why use Appwrite Functions in this project?

- To enforce **role-based security** on backend operations (e.g., Preceptor vs. Guest vs. Facilitator).
- To **separate frontend and backend concerns**, keeping the Next.js project lightweight.
- To allow **scalable serverless execution** without worrying about managing servers.
- To **securely access databases** and other Appwrite resources with minimal attack surface.