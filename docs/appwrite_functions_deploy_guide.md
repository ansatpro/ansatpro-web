# Appwrite Functions Deployment Guide

This guide explains how we deploy backend logic using **Appwrite Functions** via the Appwrite Console.

---

## 📦 Prerequisites

- An active Appwrite project (cloud or self-hosted).
- Prepared function source code (including `index.js`, `package.json`, etc.).
- Packaged function as a `.zip` or `.tar.gz` archive.

---

## 🚀 Deployment via Console

1. **Access Appwrite Console**
   - Log in to your Appwrite Console.
   - Navigate to your project → Go to the **Functions** section.

2. **Create a Function**
   - Click **"Create Function"**
   - Set:
     - **Name**: e.g., `generate_ai_feedback`
     - **Runtime**: Node.js 18
     - **Permissions**: allow `any` or restrict as needed

3. **Deploy the Code**
   - Open the **Deployments** tab under your function.
   - Click **"New Deployment"**
     - Select **Upload a File**
     - Upload your zipped code archive
     - Set the correct entry point (e.g., `index.js`)

4. **Environment Variables (Optional)**
   - Go to the **Settings** tab
   - Add any necessary variables (e.g., `OPENAI_API_KEY`)

5. **Test the Function**
   - Use **Execute Now**
   - Provide test input in JSON format
   - Monitor output and logs in the **Executions** tab

---

## 📡 Calling the Function

You can call Appwrite Functions from the frontend using the Appwrite SDK or via raw HTTP.

> 👉 For detailed usage patterns and endpoint examples, refer to:  
> `../functions/functions_README.md`

Here’s a basic example using a direct HTTP request:

```js
fetch('https://[APPWRITE_ENDPOINT]/v1/functions/[FUNCTION_ID]/executions', {
  method: 'POST',
  headers: {
    'X-Appwrite-Project': '[PROJECT_ID]',
    'X-Appwrite-Key': '[API_KEY]',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ input: "your_payload" })
});
