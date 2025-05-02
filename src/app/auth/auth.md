# Overview

This folder implements the shared **user authentication flow**, supporting both Preceptor and Facilitator roles.

---

## Directory Structure

```
src/app/auth/
├── login/             # Login form and role-based redirection
├── register/          # Role selection and account registration
├── forgot-password/   # Request reset link by email
└── reset-password/    # Securely set new password from email link
```

Each folder includes a single `page.js` file handling UI logic and Appwrite API calls.

---

## Features Implemented

- **Login**
  - Email + password input with validation
  - Error handling and role-based redirection

- **Register**
  - Role selection: Preceptor or Facilitator
  - Double password confirmation and visibility toggle
  - Mandatory NMBA declaration checkbox

- **Forgot Password**
  - Input email to receive secure password reset link via Appwrite

- **Reset Password**
  - Enter new password via secure link
  - Enforces frontend password complexity rules

---

##  How to Use

1. **Access `auth/login` to sign in**:
   - Enter correct email and password (must be verified by Appwrite).
   - On success, the system redirects based on user role.

2. **To register a new account**:
   - Navigate to `/auth/register`
   - Choose a role, input password and confirm, agree to NMBA requirement

3. **To recover password**:
   - Go to `/auth/forgot-password`
   - Submit email → check inbox → click secure link
   - Reset password in `/auth/reset-password` with enforced validation

---

## Technical Highlights

- Password validation on both register and reset:
  - Minimum 8 characters
  - Disallow common/repeated sequences (e.g., `123456`, `aaaaaa`)
- Role detection and auto-redirect after login
- Appwrite session handling and error catch
- Responsive, accessible forms using Tailwind CSS

---

## Contribution Scope

- Full UI and validation logic for each auth step
- Styling, error messaging, and user guidance flows

> **Location:** `src/app/auth/`

---