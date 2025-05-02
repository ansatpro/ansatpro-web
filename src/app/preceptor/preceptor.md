# Overview

This folder contains the complete **Preceptor-side interface** for the System.  
It allows Preceptors to search students, submit feedback (with AI assistance), and manage their settings and profile.

---

## Directory Structure

```
src/app/preceptor/
├── home/                      # Welcome page after login
├── searchStudents/           # Search students by ID
├── addPreceptorFeedbacks/    # Write structured feedback
├── preceptorAiFeedback/      # AI-mapped ANSAT criteria selection
├── success/                  # Confirmation after submission
├── previousFeedbacks/        # View and filter feedback history
├── profile/                  # View profile and upload avatar
└── settings/                 # Change password, Help/About
```

Each folder contains a `page.js` file that handles the UI and interactions for that specific feature.

---

## Features Implemented

- **Home**
  - Landing page with two main options: Add Feedback, View Previous Feedback
  - Uses shared layout and sidebar

- **Search Students**
  - Enter student name to find and confirm before feedback
  - Clean, focused interface for quick access

- **Add Feedback**
  - Write a comment with character counter
  - Select if feedback was discussed with student and/or needs facilitator attention
  - Triggers next AI analysis step

- **AI Feedback**
  - Feedback text is analyzed and matched to relevant ANSAT items
  - User can adjust, add/remove items, and tag them as positive/negative
  - Must select at least one item before submitting

- **Previous Feedbacks**
  - View feedback history
  - Filter by date, university, and clinic area
  - Expand entries to see full details and AI-tagged items

- **Settings**
  - Change password using Appwrite reset flow
  - Help & About sections for quick guidance

- **Profile**
  - Displays name, email, and role
  - Upload avatar functionality (optional)

---

## How to Use

1. **Login as a Preceptor** and land on the Home page.
2. Choose `Add Feedback` to begin:
   - Search for a student → Write feedback → Confirm AI-tagged items → Submit
3. Or go to `View Previous Feedback` to browse feedback history.
4. Update settings or change your password anytime via the sidebar.
5. Your session and data are securely managed via Appwrite.

---

## Technical Highlights

- Modular structure with one folder per feature
- Layout handled by shared components: `PreceptorLayout`, `precptorTopBar`, and `preceptorSidebar`
- Fully responsive (optimized for 1280x832 and mobile)
- Smooth animations using `framer-motion`
- Integrated with Appwrite for auth and secure feedback submission

---

## Contribution Scope

- Full UI and logic for all Preceptor pages
- Multi-step feedback flow 
- Responsive design, state handling, and user experience polish

> **Location:** `src/app/preceptor/*`

---