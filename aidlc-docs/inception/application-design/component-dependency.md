# Component Dependency — Hệ Thống Trắc Nghiệm Trực Tuyến

## Dependency Matrix

| Component | AuthService | DataService | ExamService | ImportService | ExportService | StatisticsService |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| LoginPage | ✅ | | | | | |
| RegisterPage | ✅ | | | | | |
| ExamListPage | ✅ | | ✅ | | | |
| ExamPage | ✅ | | ✅ | | | |
| ResultPage | ✅ | ✅ | | | | |
| AdminLoginPage | ✅ | | | | | |
| AdminDashboardPage | ✅ | | | | | ✅ |
| AdminExamEditorPage | ✅ | ✅ | | ✅ | | |
| AdminStatisticsPage | ✅ | | | | ✅ | ✅ |
| AdminStudentResultsPage | ✅ | ✅ | | | ✅ | |
| **AuthService** | | ✅ | | | | |
| **ExamService** | | ✅ | | | | |
| **StatisticsService** | | ✅ | | | | |

---

## Navigation Flow

```
[login.html] ---------> [index.html] ---------> [exam.html] ---------> [result.html]
     |                       ^                                                |
     v                       |                                                v
[register.html]          [logout]                                        [index.html]

[admin/login.html] ----> [admin/dashboard.html]
                               |
              +----------------+--------------------+
              |                |                    |
    [admin/exam-editor.html] [admin/statistics.html] [admin/student-results.html]
```

---

## Data Flow Diagrams

### User Login Flow
```
LoginPage
  --> AuthService.login(username, password)
    --> DataService.getUserByUsername(username)
      <-- User | null
    --> validate password
    --> localStorage.setItem('currentUser', ...)
  <-- {success: true, user}
  --> window.location.href = 'index.html'
```

### Exam Taking Flow
```
ExamListPage
  --> ExamService.getAvailableExams()
    --> DataService.getExams()
    --> filter by type + startTime
  <-- Exam[]
  --> render cards, disable locked exams

[User clicks "Bắt đầu"]
  --> ExamService.startExam(examId, userId)
    --> DataService.getExamById(examId)
    --> create ExamSession { id, examId, userId, startTime, answers:[] }
    --> localStorage.setItem('httn_exam_session', ...)
  --> window.location.href = 'exam.html'

ExamPage
  --> ExamService.getExamSession()
  --> render questions, start countdown timer
  [User selects answer]
    --> ExamService.saveAnswer(sessionId, qIndex, aIndex)
      --> update localStorage['httn_exam_session']
  [Submit or timer=0]
    --> ExamService.submitExam(sessionId)
      --> ExamService.calculateScore(questions, answers)
      --> DataService.saveResult(ExamResult)
      --> localStorage.removeItem('httn_exam_session')
    --> window.location.href = 'result.html'
```

### Admin Excel Import Flow
```
AdminExamEditorPage
  [User uploads .xlsx file]
  --> ImportService.parseExcelFile(file)
    --> XLSX.read(file) [SheetJS CDN]
    --> ImportService.validateExcelFormat(rows)
    --> ImportService.mapRowsToQuestions(rows)
  <-- { questions: Question[], errors: string[] }
  --> render preview table
  [User clicks "Lưu"]
  --> DataService.saveExam({ ...examInfo, questions })
```

### Admin PDF Export Flow
```
AdminStatisticsPage
  [User clicks "Xuất PDF"]
  --> StatisticsService.filterResults(examId, startDate, endDate)
  --> StatisticsService.getStatsByExam(...)
  --> ExportService.exportStatsPDF(stats, examName)
    --> new jsPDF()
    --> add title, table, score distribution
    --> doc.save('thong-ke-[timestamp].pdf')
```

---

## Script Loading Order (per page)

All pages phải load scripts theo thứ tự:

### User Pages
```html
<!-- CDN Libraries (load trước) -->
<script src="CDN: Chart.js"></script>
<!-- Data & Services -->
<script src="data/mock-data.js"></script>
<script src="js/data-service.js"></script>
<script src="js/auth.js"></script>
<script src="js/exam-service.js"></script>  <!-- chỉ exam.html, index.html -->
<script src="js/export-service.js"></script> <!-- chỉ result.html -->
<!-- Page-specific -->
<script src="js/[page-name].js"></script>
```

### Admin Pages
```html
<!-- CDN Libraries -->
<script src="CDN: Chart.js"></script>
<script src="CDN: SheetJS"></script>   <!-- chỉ exam-editor.html -->
<script src="CDN: jsPDF"></script>     <!-- chỉ statistics.html, student-results.html -->
<!-- Data & Services -->
<script src="../data/mock-data.js"></script>
<script src="../js/data-service.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/statistics-service.js"></script>   <!-- dashboard, statistics -->
<script src="../js/import-service.js"></script>       <!-- exam-editor -->
<script src="../js/export-service.js"></script>       <!-- statistics, student-results -->
<!-- Page-specific -->
<script src="../js/admin/[page-name].js"></script>
```
