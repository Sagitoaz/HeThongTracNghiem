# Integration Test Instructions

**Purpose**: Validate complete end-to-end user workflows spanning multiple units/pages.  
**Environment**: Browser with localStorage enabled, internet for CDN  
**Before each scenario**: Clear localStorage + sessionStorage, then reload `login.html`

---

## Scenario 1: Student Complete Exam Flow

**Tests**: Auth → Exam List → Exam Taking → Result Review  
**Units covered**: UNIT-02 + UNIT-03

### Steps

1. **Register new account**
   - Open `login.html`, click "Đăng ký tài khoản"
   - Register: username=`integtest1`, fullName=`Tích hợp 1`, email=`it1@ptit.edu.vn`, password=`test123`
   - Expected: Redirected to `login.html?registered=1` with success banner

2. **Login with new account**
   - Enter `integtest1` / `test123`
   - Expected: Redirected to `index.html`, navbar shows `integtest1`

3. **Browse exam list**
   - Expected: At least 1 exam card visible (exam-001 "Mạng Máy Tính Cơ Bản")
   - Search for "mang" — expected: exam card visible
   - Clear search — expected: full list restored

4. **Start exam**
   - Click "Bắt đầu" on exam-001
   - Expected: Redirected to `exam.html?id=exam-001`, timer starts, first question shown

5. **Answer all 10 questions**
   - Select one option per question using navigator and Next/Prev buttons
   - Expected: Navigator grid updates each answered question with a distinct color

6. **Submit exam**
   - Click "Nộp bài", confirm in modal
   - Expected: Redirected to `result.html?id=<id>`

7. **Verify result page**
   - Expected: Score hero displayed (0.0–10.0)
   - Stat cards: exam name, score, correct count, duration, submitted time
   - Doughnut chart renders
   - All 10 questions listed in review section

8. **Verify data persisted**
   - Open DevTools → Application → localStorage
   - Check `httn_results` includes the new result with correct userId and examId
   - **PASS** entire scenario

---

## Scenario 2: Exam Resume After Interruption

**Tests**: Session persistence across page closes  
**Units covered**: UNIT-01 + UNIT-03

### Steps

1. Login as `sv002` / `123456`
2. Start exam-001
3. Answer questions 1, 3, 5 (skip others)
4. Navigate to `index.html` (do NOT submit)
5. Click "Bắt đầu" on exam-001 again
6. Expected: Exam resumes with Q1, Q3, Q5 already marked as answered in navigator
7. **PASS** if resumed session preserves all answers

---

## Scenario 3: Admin Full Exam Lifecycle

**Tests**: Create exam → Add questions → Student takes exam → View results  
**Units covered**: UNIT-02 + UNIT-04 + UNIT-03 + UNIT-05

### Steps

1. **Admin login** — Open `admin/login.html`, login as `admin` / `admin123`

2. **Create new exam**
   - Open `admin/exam-editor.html`
   - Click "Thêm đề thi"
   - Title: `Kiểm tra tích hợp`, Duration: 15, Type: Mở, Status: Hoạt động
   - Save — expected: new row appears in exam table

3. **Add 3 questions**
   - Click "Câu hỏi" on the new exam
   - Add Q1: text=`2+2=?`, options=[1,2,3,4], correct=3 (index of "4"), explanation=`4 là đáp án`
   - Add Q2: text=`3+3=?`, options=[5,6,7,8], correct=1 (index of "6"), explanation=`6 là đáp án`
   - Add Q3: text=`1+1=?`, options=[1,2,3,4], correct=1 (index of "2"), explanation=`2 là đáp án`
   - Expected: Question count shows 3

4. **Student takes the new exam**
   - Open new tab (or use private window), login as `sv003` / `123456`
   - Expected: New exam card "Kiểm tra tích hợp" appears on `index.html`
   - Take exam, answer all 3 questions correctly, submit
   - Expected: Result page shows score 10.0

5. **Admin views result**
   - Return to admin session
   - Open `admin/statistics.html`
   - Select "Kiểm tra tích hợp" from exam dropdown
   - Expected: 1 submission, avg score 10.0, doughnut shows 3 correct 0 wrong

6. **Admin finds student's result**
   - Open `admin/student-results.html`
   - Filter by username `sv003`
   - Expected: Row shows exam "Kiểm tra tích hợp", score 10.0

7. **PDF export validation**
   - Click "Xuất PDF" for sv003's row
   - Expected: PDF downloads with student details and result

**PASS** if entire flow completes without errors.

---

## Scenario 4: Admin Auth Guard Validation

**Tests**: 403 guard blocks unauthenticated access to all admin pages  
**Units covered**: UNIT-02 + UNIT-04

### Steps

For each admin page, open it WITHOUT being logged in as admin:

| URL | Expected |
|---|---|
| `admin/dashboard.html` | 403 error content displayed |
| `admin/exam-editor.html` | 403 error content displayed |
| `admin/statistics.html` | 403 error content displayed |
| `admin/student-results.html` | 403 error content displayed |

Also verify:
- Student session does NOT grant admin access (login as `sv001`, then try `admin/dashboard.html`)
- **PASS** if all 4 pages show 403 and do NOT render admin content

---

## Scenario 5: Data Isolation Between Sessions

**Tests**: Two students cannot see each other's results  
**Units covered**: UNIT-01 + UNIT-03

### Steps

1. Login as `sv001`, take exam-001, submit — note resultId1
2. Logout
3. Login as `sv002`, take exam-001, submit — note resultId2
4. Try navigating to `result.html?id=<resultId1>` while logged in as `sv002`
5. Expected: Either shows sv002's own results page OR shows an error/redirect (not sv001's result)

**Implementation Note**: The current result.js loads by resultId from URL param — if it doesn't validate ownership, this test may reveal the gap. Document the behaviour observed.

---

## Integration Test Setup

### Reset Instructions (between scenarios)
```
1. Open DevTools → Application → Local Storage
2. Click "Clear All" 
3. DevTools → Application → Session Storage
4. Click "Clear All"
5. Reload login.html
```

### Success Criteria

| Scenario | Status |
|---|---|
| 1 — Student Complete Flow | PASS / FAIL |
| 2 — Exam Resume | PASS / FAIL |
| 3 — Admin Full Lifecycle | PASS / FAIL |
| 4 — Auth Guard | PASS / FAIL |
| 5 — Data Isolation | PASS / PARTIAL / FAIL |

**Release criteria**: Scenarios 1–4 must PASS. Scenario 5 result should be documented.
