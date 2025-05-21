# 🧠 Developer Guide: ANSATPro

This document provides essential technical guidance for developers working on the ANSATPro system. It outlines project responsibilities, backend functions, data access policies, authentication workflows, and test/deployment integration.

---

## 1. 📦 Project Overview

ANSATPro is a role-based web platform designed to streamline nursing student assessments through structured digital workflows and serverless automation.

There are two user roles:

- **Preceptor**: Clinical staff who provide performance feedback.
- **Facilitator**: University staff responsible for reviewing feedback, scoring, and generating assessment reports.

The stack includes:

- **React (Next.js)** for the frontend interface  
- **Appwrite** for backend services (authentication, database, serverless functions)  
- **Tailwind CSS** for styling  
- **Vercel** for frontend hosting  

---

## 2. 🧱 Project Documentation by Area

Instead of listing the file structure here, please refer to the following dedicated documentation for each development area:

- **Facilitator-side frontend structure**:  
  [`../src/app/facilitator/facilitator.md`](../src/app/facilitator/facilitator.md)

- **Preceptor-side frontend structure**:  
  [`../src/app/preceptor/preceptor.md`](../src/app/preceptor/preceptor.md)

- **Backend Appwrite Functions**:  
  [`../functions/functions_README.md`](../functions/functions_README.md)

- **Testing folder structure**:  
  [`../src/__tests__/SRUCTURE.md`](../src/__tests__/SRUCTURE.md)

---

## 3. ⚙️ Appwrite Functions (Backend API)

All business logic and data operations are handled via Appwrite Functions. These serverless functions act as the **only interface between the frontend and the backend database**, ensuring proper authentication and authorization.

Every function is documented in its own subfolder, and an overview is provided here:  
📄 [`../functions/functions_README.md`](../functions/functions_README.md)

---

## 4. 🧩 Database Access & Authorization

The Appwrite database is **not directly accessible** from the frontend. All data operations must be performed via Appwrite Functions, which include role-based permission checks.

- Every user action triggers a backend function.
- Functions handle data creation, retrieval, and updates securely.

> 📊 For detailed collection schemas, see:  
> [`./database_schema.xlsx`](./ANSAT_Pro_Database_Design.xlsx)  
> [`./database_structure.png`](./database_structure.png)

---

## 5. 🔐 Authentication & Role Assignment

Authentication is fully managed by Appwrite. Key implementation features:

- Users must verify their email during first login.
- A **JWT token** is used to access Appwrite Functions.
- Roles (`preceptor` or `facilitator`) are determined at registration and stored in the `user_metadata` collection.
- Access control is enforced by backend logic based on these roles.

---


## 6. 📡 Deployment

You can view the following link to get the details of how to deploy the whole website through vercel:

[`vercel_deploy_guide`](https://docs.google.com/document/d/1BJ0mslXzW320X138OfFSK-4PIl_TWynN1MgbijUk5bI/edit?tab=t.0#heading=h.gqmveof3xfmw)

And you can get the details of how to deploy appwrite function through: 
> [`./appwrite_functions_deploy_guide.md`](./appwrite_functions_deploy_guide.md)  


---


## 6. 🧪 Testing

A detailed test plan and test cases are provided in:

- 📁 [Test folder README](../src/__tests__/README.md)

This includes:
- Manual and automated testing approaches
- Sample payloads and expected outputs
- Edge case coverage

---

## 7. 📎 Resources Summary

- **Frontend (Facilitator)**: [`../src/app/facilitator/facilitator.md`](../src/app/facilitator/facilitator.md)
- **Frontend (Preceptor)**: [`../src/app/preceptor/preceptor.md`](../src/app/preceptor/preceptor.md)
- **Functions Overview**: [`../functions/functions_README.md`](../functions/functions_README.md)
- **Test Structure**: [`../src/__tests__/SRUCTURE.md`](../src/__tests__/SRUCTURE.md)
- **Test Guide**: [`../src/__tests__/README.md`](../src/__tests__/README.md)
- **Database Schema (Excel)**: [`./ANSAT_Pro_Database_Design.xlsx`](./ANSAT_Pro_Database_Design.xlsx)
- **System Architecture (Diagram)**: [`./database_structure.png`](./database_structure.png)
