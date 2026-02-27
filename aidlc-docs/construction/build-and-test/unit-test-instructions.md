# Unit Test Instructions

**Test Type**: Manual browser testing (no automated test framework)  
**Environment**: Chrome / Edge with DevTools open (F12)  
**Reset between tests**: DevTools → Application → Local Storage → Clear All, then reload

---

## UNIT-01: Shared Foundation

Test the data layer and auth service directly via DevTools Console.

### Test 1.1 — DataService Initialization
1. Clear localStorage completely
2. Open `login.html`
3. In Console, run:
```javascript
console.log(DataService.getUsers().length);      // Expected: 6
console.log(DataService.getExams().length);      // Expected: 2
console.log(DataService.getResults().length);    // Expected: 5
console.log(localStorage.getItem('httn_initialized')); // Expected: "true"
```
**PASS** if all expectations match.

### Test 1.2 — DataService CRUD: User
```javascript
// Create
const id = DataService.saveUser({ username: 'testuser', email: 'test@test.com', role: 'student', password: 'hashedpw', createdAt: new Date().toISOString() });
console.log(id); // Expected: non-null string like "user-xxx"

// Read
const u = DataService.getUserById(id);
console.log(u.username); // Expected: "testuser"

// Update
u.email = 'updated@test.com';
DataService.saveUser(u);
console.log(DataService.getUserById(id).email); // Expected: "updated@test.com"

// Delete
DataService.deleteUser(id);
console.log(DataService.getUserById(id)); // Expected: undefined
```
**PASS** if all expectations match.

### Test 1.3 — DataService CRUD: Exam
```javascript
const eid = DataService.saveExam({ title: 'Test Exam', description: 'desc', duration: 30, type: 'free', status: 'active', questions: [] });
console.log(DataService.getExamById(eid).title); // Expected: "Test Exam"
DataService.deleteExam(eid);
console.log(DataService.getExamById(eid)); // Expected: undefined
```

### Test 1.4 — AuthService Register + Login
```javascript
// Register
const reg = AuthService.register('newstudent', 'New Student', 'new@ptit.edu.vn', 'password123');
console.log(reg.success); // Expected: true

// Duplicate username
const dup = AuthService.register('newstudent', 'Another', 'other@ptit.edu.vn', 'pw123');
console.log(dup.success); // Expected: false
console.log(dup.error);   // Expected: contains "tồn tại" or similar

// Login
const login = AuthService.login('newstudent', 'password123');
console.log(login.success); // Expected: true
console.log(AuthService.getCurrentUser().username); // Expected: "newstudent"

// Wrong password
const bad = AuthService.login('newstudent', 'wrongpw');
console.log(bad.success); // Expected: false
```

---

## UNIT-02: Authentication Pages

Manual tests performed in the browser.

### Test 2.1 — Student Login: Valid credentials
1. Open `login.html`
2. Enter `sv001` / `123456`
3. Click Đăng nhập
**PASS** if redirected to `index.html` and navbar shows `sv001`

### Test 2.2 — Student Login: Invalid credentials
1. Open `login.html`
2. Enter `sv001` / `wrongpassword`
3. Click Đăng nhập
**PASS** if red error banner appears, no redirect

### Test 2.3 — Student Login: Empty fields
1. Open `login.html`
2. Leave fields empty, click Đăng nhập
**PASS** if field-level error messages appear under each empty field

### Test 2.4 — Password Toggle
1. Open `login.html`
2. Enter password, click the eye icon
**PASS** if password text becomes visible; click again → hidden

### Test 2.5 — Student Registration: Valid
1. Open `register.html`
2. Fill: username=`newuser88`, fullName=`New User`, email=`new@ptit.edu.vn`, password=`secret123`, confirmPassword=`secret123`
3. Click Đăng ký
**PASS** if redirected to `login.html?registered=1` and success banner shows

### Test 2.6 — Registration: Duplicate username
1. Register with an existing username (e.g. `sv001`)
**PASS** if error banner appears, no redirect

### Test 2.7 — Registration: Field validation
1. Try username shorter than 3 chars → should show field error
2. Try invalid email (no @) → should show field error
3. Try password shorter than 6 chars → field error
4. Try non-matching confirm password → field error

### Test 2.8 — Admin Login: Valid
1. Open `admin/login.html`
2. Enter `admin` / `admin123`
3. Click Đăng nhập
**PASS** if redirected to `admin/dashboard.html`

### Test 2.9 — Admin Login: Wrong credentials
**PASS** if error banner appears

---

## UNIT-03: User Exam Flow

### Test 3.1 — Exam List Page
1. Login as `sv001` / `123456`
2. Verify `index.html` shows:
   - Navbar with username and logout button
   - At least 1 exam card with title, duration, question count
   - Exam type badge (Mở / Định kỳ)
**PASS** if exam cards render correctly

### Test 3.2 — Search Filter
1. On `index.html`, type in search box
**PASS** if cards filter in real-time by title/description

### Test 3.3 — Exam Taking: Start
1. Click "Bắt đầu" on an active exam
**PASS** if redirected to `exam.html?id=exam-001`

### Test 3.4 — Exam Taking: Timer
1. On `exam.html`, verify:
   - Timer counts down from the exam duration (in seconds)
   - Timer turns yellow/orange when ≤ 5 minutes
   - Timer turns red when ≤ 1 minute
**PASS** if color transitions occur at the correct thresholds

### Test 3.5 — Exam Taking: Question Navigation
1. Select an answer for Question 1
2. Click "Tiếp theo" or click question 2 in navigator
3. Verify navigator shows Question 1 as answered (different color)
4. Navigate back to Q1, verify answer is still selected
**PASS** if navigation and state persistence work

### Test 3.6 — Exam Submission
1. Answer all 10 questions
2. Click "Nộp bài"
3. Confirm modal appears with 0 unanswered questions
4. Confirm submission
**PASS** if redirected to `result.html?id=<resultId>`

### Test 3.7 — Exam Submission: Partial answers
1. Answer only 5 of 10 questions, click "Nộp bài"
**PASS** if modal warns "X câu chưa trả lời"

### Test 3.8 — Result Page
1. On `result.html`:
   - Score hero shows the score (e.g. 8.0/10)
   - Stat cards show: exam name, score, correct count, duration, submitted time
   - Chart.js doughnut renders (correct vs wrong arc)
   - Question review section shows each question with correct/wrong indicators and explanations
**PASS** if all elements render correctly

### Test 3.9 — Exam Resume
1. Start an exam, answer 3 questions, close the browser tab
2. Navigate back to `index.html`, click "Bắt đầu" on same exam
**PASS** if exam resumes from where it was left off (answers preserved)

### Test 3.10 — Guard: Accessing exam.html without login
1. Logout (or clear sessionStorage)
2. Directly navigate to `exam.html?id=exam-001`
**PASS** if redirected to `login.html`

---

## UNIT-04: Admin Core

### Test 4.1 — Admin Guard
1. Open `admin/dashboard.html` without admin session
**PASS** if 403 error page is shown (not redirected, just blocked)

### Test 4.2 — Dashboard Stats
1. Login as admin
2. Open `admin/dashboard.html`
**PASS** if 4 stat cards show correct counts: Users (5), Exams (2), Submissions (5), Avg Score (numeric)

### Test 4.3 — Dashboard Recent Submissions
**PASS** if table shows up to 10 recent submissions with username, exam name, score

### Test 4.4 — Exam List in Editor
1. Open `admin/exam-editor.html`
**PASS** if table shows 2 exams with title, type, status, question count

### Test 4.5 — Add Exam
1. Click "Thêm đề thi"
2. Fill in title, description, duration, type, status
3. Click Save
**PASS** if new exam appears in the table

### Test 4.6 — Edit Exam
1. Click Edit on an existing exam
2. Modify the title
3. Click Save
**PASS** if table reflects the updated title

### Test 4.7 — Delete Exam
1. Click Delete on an exam
2. Confirm in the modal
**PASS** if exam is removed from the table

### Test 4.8 — View Questions
1. Click "Câu hỏi" (Questions) on exam-001
**PASS** if question panel appears with 10 questions listed

### Test 4.9 — Add Question manually
1. In question panel, click "Thêm câu hỏi"
2. Fill in question text, 4 options, correct answer (0-3), explanation
3. Click Save
**PASS** if question count increments and new question appears in list

### Test 4.10 — Excel Import
1. Prepare an Excel file with columns: A=question, B-E=options, C=correctAnswer(0-3), G=explanation (row 1 = header)
2. Click import zone or drag-drop the file
**PASS** if questions are parsed and shown as a preview, then imported to exam

---

## UNIT-05: Admin Reports

### Test 5.1 — Statistics Page: Overall Stats
1. Open `admin/statistics.html`
**PASS** if overall stat cards show: total submissions, overall avg score, exam select populated

### Test 5.2 — Statistics: Exam Filter
1. Select a different exam from the dropdown
**PASS** if stat cards and charts update to show that exam's data

### Test 5.3 — Doughnut Chart
**PASS** if Chart.js doughnut shows correct vs wrong answers ratio for selected exam

### Test 5.4 — Bar Chart (Score Distribution)
**PASS** if Chart.js bar chart shows 5 score buckets: <2, 2-4, 4-6, 6-8, 8-10

### Test 5.5 — Results Table in Statistics
**PASS** if results table shows student username, score, date — sorted descending by score

### Test 5.6 — PDF Export (Statistics)
1. Click "Xuất PDF"
**PASS** if browser prompts download of a `.pdf` file containing statistics summary

### Test 5.7 — Student Results: Filter by Username
1. Open `admin/student-results.html`
2. Type a username in the filter box (e.g. `sv001`)
**PASS** if table filters to show only that student's results

### Test 5.8 — Student Results: Filter by Exam
1. Select a specific exam from the exam dropdown
**PASS** if table shows only results for that exam

### Test 5.9 — Student PDF Export
1. Click "Xuất PDF" button in a result row
**PASS** if browser downloads a PDF with that student's result details

---

## Test Coverage Summary

| Unit | Tests | Total |
|---|---|---|
| UNIT-01 Shared Foundation | 1.1, 1.2, 1.3, 1.4 | 4 |
| UNIT-02 Authentication | 2.1–2.9 | 9 |
| UNIT-03 User Exam Flow | 3.1–3.10 | 10 |
| UNIT-04 Admin Core | 4.1–4.10 | 10 |
| UNIT-05 Admin Reports | 5.1–5.9 | 9 |
| **Total** | | **42** |

**Expected**: All 42 tests PASS  
**Failure threshold**: 0 P0/P1 failures acceptable for release
