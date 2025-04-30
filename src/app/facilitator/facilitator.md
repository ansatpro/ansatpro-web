### **Project Architecture Diagram (Facilitator)**


```
facilitator/
├── layout.js                # Root layout for the facilitator section
├── home/                    # Home page for facilitators
│   └── page.js              # Displays welcome message and quick actions
├── student/                 # Student management section
│   ├── page.js              # Student dashboard with registration and list options
│   ├── studentRegister/     # Student registration functionality
│   │   └── page.js          # Form for manual and bulk student registration
│   ├── studentList/         # Student list management
│   │   └── page.js          # Table view of students with filtering and deletion
│   └── success/             # Success page after student registration
│       └── page.js          # Confirmation message and navigation options
├── notification/            # Notification system
│   └── page.js              # Displays and manages notifications
├── settings/                # Facilitator settings
│   └── page.js              # Profile management, password change, and support
├── feedback/                # Feedback management system
│   ├── page.js              # Overview of all feedback with filtering
│   ├── [id]/                # Feedback detail pages
│   │   ├── layout.js        # Layout for feedback detail pages
│   │   ├── feedbackDetail/  # Detailed view of a specific feedback
│   │   │   └── page.js      # Displays feedback details and discussion status
│   │   └── studentDetail/   # Student-specific feedback management
│   │       ├── page.js      # Student details and feedback confirmation
│   │       ├── createFeedback/  # Create or review feedback
│   │       │   └── page.js  # Form for reviewing and rating feedback
│   │       └── success/     # Success page after feedback submission
│   │           └── page.js  # Confirmation message and navigation options
└── export/                  # Report export functionality
    ├── page.js              # Search and select students for report generation
    ├── [id]/                # Student-specific export pages
    │   ├── layout.js        # Layout for export detail pages
    │   └── studentDetail/   # Student details and export options
    │       ├── page.js      # Select report type and generate export
    │       └── aiSummary/   # AI-generated summary of student feedback
    │           ├── layout.js # Layout for AI summary pages
    │           └── page.js  # View and edit AI summary before export
    └── success/             # Success page after report export
        └── page.js          # Confirmation message and navigation options
```

---

### **Key Components**

1. **Layout (`layout.js`)**  
   - Root layout for the facilitator section, wrapping all pages with a consistent structure.

2. **Home (`home/page.js`)**  
   - Displays a welcome message and quick access to key functionalities (e.g., student registration, feedback review, report export).

3. **Student Management (`student/`)**  
   - **Dashboard (`page.js`)**: Provides options to register students or view the student list.  
   - **Registration (`studentRegister/page.js`)**: Supports manual and bulk student registration via CSV upload.  
   - **Student List (`studentList/page.js`)**: Displays a table of students with filtering, searching, and deletion options.  
   - **Success Page (`success/page.js`)**: Confirms successful student registration and provides navigation options.

4. **Notification System (`notification/page.js`)**  
   - Displays real-time notifications, supports marking as read, and integrates with local storage for persistence.

5. **Settings (`settings/page.js`)**  
   - Allows facilitators to manage their profile, change passwords, and access support resources.

6. **Feedback Management (`feedback/`)**  
   - **Overview (`page.js`)**: Displays all feedback with filtering and search capabilities.  
   - **Detail Pages (`[id]/`)**:  
     - **Feedback Detail (`feedbackDetail/page.js`)**: Shows detailed information about a specific feedback.  
     - **Student Detail (`studentDetail/page.js`)**: Confirms student details before reviewing feedback.  
     - **Create/Review Feedback (`createFeedback/page.js`)**: Form for reviewing and rating feedback.  
     - **Success Page (`success/page.js`)**: Confirms successful feedback submission.

7. **Report Export (`export/`)**  
   - **Search (`page.js`)**: Allows facilitators to search for students and select report types.  
   - **Student Detail (`[id]/studentDetail/page.js`)**: Displays student details and export options.  
   - **AI Summary (`aiSummary/page.js`)**: Generates and edits an AI-powered summary of student feedback.  
   - **Success Page (`success/page.js`)**: Confirms successful report export.

---

### **Key Features**
- **Modular Design**: Each section (e.g., student, feedback, export) is self-contained and follows a consistent structure.  
- **Dynamic Routing**: Uses Next.js dynamic routing (`[id]/`) for student-specific and feedback-specific pages.  
- **Local Storage Integration**: Persists data (e.g., read notifications, selected students) across sessions.  
- **Responsive UI**: Built with **Tailwind CSS** for a clean and modern design.  
- **Error Handling**: Robust error handling for API calls and user interactions.  

---

This architecture ensures scalability, maintainability, and a seamless user experience for facilitators.
