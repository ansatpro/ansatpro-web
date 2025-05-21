# Facilitator Module Structure

```
src/app/facilitator/
├── facilitator.md
├── layout.js
├── home/
│   └── page.js
├── student/
│   ├── page.js
│   ├── studentList/
│   │   └── page.js
│   ├── studentRegister/
│   │   └── page.js
│   └── success/
│       └── page.js
├── feedback/
│   ├── page.js
│   └── [id]/
│       ├── layout.js
│       ├── studentDetail/
│       │   ├── page.js
│       │   └── createFeedback/
│       │       ├── page.js
│       │       └── success/
│       │           └── page.js
│       └── feedbackDetail/
│           └── page.js
├── notification/
│   └── page.js
├── export/
│   ├── page.js
│   ├── success/
│   │   └── page.js
│   └── [id]/
│       ├── layout.js
│       └── studentDetail/
│           ├── page.js
│           └── aiSummary/
│               ├── layout.js
│               └── page.js
└── settings/
    └── page.js
```

## File Descriptions

- `layout.js`: Layout component for the facilitator module
- `home/page.js`: Dashboard page for facilitators
- `student/page.js`: Main student management page
- `student/studentList/page.js`: Page for listing and managing all students
- `student/studentRegister/page.js`: Page for registering new students
- `student/success/page.js`: Success confirmation page for student operations
- `feedback/page.js`: Main feedback management page
- `feedback/[id]/layout.js`: Layout for dynamic feedback routes
- `feedback/[id]/studentDetail/page.js`: Student detail view for feedback
- `feedback/[id]/studentDetail/createFeedback/page.js`: Page for creating new feedback
- `feedback/[id]/studentDetail/createFeedback/success/page.js`: Success confirmation for feedback creation
- `feedback/[id]/feedbackDetail/page.js`: Detailed view of specific feedback
- `notification/page.js`: Notification management page
- `export/page.js`: Main export page
- `export/success/page.js`: Success confirmation for export operations
- `export/[id]/layout.js`: Layout for dynamic export routes
- `export/[id]/studentDetail/page.js`: Student detail export page
- `export/[id]/studentDetail/aiSummary/layout.js`: Layout for AI summary
- `export/[id]/studentDetail/aiSummary/page.js`: AI-generated summary page
- `settings/page.js`: User settings page

