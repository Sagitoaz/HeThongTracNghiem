# Domain Entities — Unit 1: Shared Foundation

## LocalStorage Collections

All data is stored in `localStorage` as JSON-serialized strings under these keys:

| Key | Type | Description |
|---|---|---|
| `httn_initialized` | `boolean` | true after first-run seed |
| `httn_users` | `User[]` | Registered students + admin accounts |
| `httn_exams` | `Exam[]` | Exam definitions with questions |
| `httn_results` | `ExamResult[]` | Completed exam submissions |
| `httn_exam_session` | `ExamSession` | In-progress exam (deleted after submit) |
| `currentUser` | `SessionUser` | Currently logged-in student session |
| `adminUser` | `SessionUser` | Currently logged-in admin session |

---

## Entity Schemas

### User
```javascript
{
  id: string,           // "1740000000000-abc123xyz"
  username: string,     // unique, 3-20 chars
  email: string,        // valid email format
  password: string,     // plain text (demo only)
  role: "user"|"admin", // determines access level
  createdAt: string     // ISO 8601 timestamp
}
```

### Exam
```javascript
{
  id: string,
  name: string,             // e.g. "Luyện tập Mạng Máy Tính"
  description: string,
  type: "free"|"scheduled", // "free" = always accessible
  duration: number,         // minutes
  startTime: string|null,   // ISO 8601, only for type="scheduled"
  questions: Question[],
  createdAt: string
}
```

### Question
```javascript
{
  id: string,
  text: string,             // question content
  options: string[],        // exactly 4 elements [A, B, C, D]
  correctAnswer: number,    // index 0-3
  explanation: string       // may be empty string ""
}
```

### ExamSession *(temporary — deleted on submit)*
```javascript
{
  id: string,
  examId: string,
  userId: string,
  startTime: string,        // ISO 8601
  answers: number[],        // index per question, -1 = unanswered
  totalQuestions: number
}
```

### ExamResult *(permanent)*
```javascript
{
  id: string,
  examId: string,
  examName: string,         // denormalized for display without join
  userId: string,
  username: string,         // denormalized
  score: number,            // 0.0–10.0, 1 decimal
  correct: number,
  total: number,
  answers: number[],        // final submitted answers
  submittedAt: string,      // ISO 8601
  duration: number          // seconds taken
}
```

### SessionUser *(in localStorage, not in collections)*
```javascript
{
  id: string,
  username: string,
  email: string,
  role: "user"|"admin"
}
```

---

## Mock Data Seed

### Admin Account
```javascript
{ id: "admin-001", username: "admin", email: "admin@ptit.edu.vn",
  password: "admin123", role: "admin", createdAt: "2026-01-01T00:00:00Z" }
```

### 5 Student Accounts
```javascript
{ id: "user-001", username: "sv001", email: "sv001@student.ptit.edu.vn", password: "123456", role: "user" }
{ id: "user-002", username: "sv002", email: "sv002@student.ptit.edu.vn", password: "123456", role: "user" }
{ id: "user-003", username: "sv003", email: "sv003@student.ptit.edu.vn", password: "123456", role: "user" }
{ id: "user-004", username: "sv004", email: "sv004@student.ptit.edu.vn", password: "123456", role: "user" }
{ id: "user-005", username: "sv005", email: "sv005@student.ptit.edu.vn", password: "123456", role: "user" }
```

### 1 Exam — "Luyện tập Mạng Máy Tính"
- `type: "free"`, `duration: 30` (minutes), 10 questions MCQ
- Topics: OSI model, TCP/IP, IP addressing, DNS, HTTP

### 5 ExamResults (1 per student, varied scores: 5.0, 6.0, 7.0, 8.0, 9.0)
