# Component Methods — Hệ Thống Trắc Nghiệm Trực Tuyến

> **Note**: Chỉ liệt kê method signatures và mục đích cao cấp.  
> Detailed business logic sẽ được định nghĩa trong **Functional Design** (Construction Phase).

---

## AuthService Methods (`js/auth.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `login(username, password)` | string, string | `{success, user}` | Kiểm tra credentials trong DataService, lưu session |
| `register(username, email, password)` | string, string, string | `{success, error}` | Tạo user mới, lưu vào DataService |
| `logout()` | — | void | Xóa user session khỏi localStorage |
| `logoutAdmin()` | — | void | Xóa admin session khỏi localStorage |
| `loginAdmin(username, password)` | string, string | `{success, admin}` | Kiểm tra admin credentials |
| `getCurrentUser()` | — | `User \| null` | Trả về user đang đăng nhập |
| `isAdminLoggedIn()` | — | boolean | Kiểm tra admin session |
| `guardUserPage()` | — | void | Redirect về login.html nếu chưa đăng nhập |
| `guardAdminPage()` | — | void | Redirect về 403 nếu không phải admin |

---

## DataService Methods (`js/data-service.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `init()` | — | void | Khởi tạo localStorage với mock data nếu chưa có |
| `getUsers()` | — | `User[]` | Lấy tất cả users |
| `getUserById(id)` | string | `User \| null` | Lấy user theo id |
| `getUserByUsername(username)` | string | `User \| null` | Tìm user theo username |
| `saveUser(user)` | `User` | void | Lưu hoặc cập nhật user |
| `deleteUser(id)` | string | void | Xóa user |
| `getExams()` | — | `Exam[]` | Lấy tất cả kỳ thi |
| `getExamById(id)` | string | `Exam \| null` | Lấy kỳ thi theo id |
| `saveExam(exam)` | `Exam` | void | Lưu hoặc cập nhật kỳ thi |
| `deleteExam(id)` | string | void | Xóa kỳ thi |
| `getResults()` | — | `ExamResult[]` | Lấy tất cả kết quả |
| `getResultsByUser(userId)` | string | `ExamResult[]` | Lấy kết quả theo user |
| `getResultsByExam(examId)` | string | `ExamResult[]` | Lấy kết quả theo kỳ thi |
| `saveResult(result)` | `ExamResult` | void | Lưu kết quả thi |

---

## ExamService Methods (`js/exam-service.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `getAvailableExams()` | — | `Exam[]` | Lấy kỳ thi có thể tham gia (lọc theo trạng thái/giờ) |
| `isExamAvailable(exam)` | `Exam` | boolean | Kiểm tra kỳ thi có thể bắt đầu không |
| `startExam(examId, userId)` | string, string | `ExamSession` | Khởi tạo session thi, lưu vào localStorage |
| `saveAnswer(sessionId, questionIndex, answerIndex)` | string, number, number | void | Lưu đáp án tạm thời |
| `submitExam(sessionId)` | string | `ExamResult` | Nộp bài, tính điểm, lưu kết quả |
| `calculateScore(questions, answers)` | `Question[]`, `number[]` | `{score, correct, total}` | Tính điểm (thang 10) |
| `getExamSession(sessionId)` | string | `ExamSession \| null` | Lấy session thi hiện tại |

---

## ImportService Methods (`js/import-service.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `parseExcelFile(file)` | `File` | `Promise<ParseResult>` | Dùng SheetJS đọc file Excel, trả về danh sách câu hỏi |
| `validateExcelFormat(rows)` | `any[][]` | `{valid, errors}` | Kiểm tra format các hàng Excel |
| `mapRowsToQuestions(rows)` | `any[][]` | `Question[]` | Chuyển đổi hàng Excel thành Question objects |
| `getExpectedFormat()` | — | string | Trả về mô tả format Excel chuẩn để hiển thị hướng dẫn |

**Excel Format chuẩn**:
| Cột A | Cột B | Cột C | Cột D | Cột E | Cột F | Cột G |
|---|---|---|---|---|---|---|
| Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng (0-3) | Giải thích |

---

## ExportService Methods (`js/export-service.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `exportStatsPDF(stats, examName)` | `StatsData`, string | void | Tạo PDF thống kê, trigger download |
| `exportStudentResultPDF(student, results)` | `User`, `ExamResult[]` | void | Tạo PDF kết quả sinh viên, trigger download |

---

## StatisticsService Methods (`js/statistics-service.js`)

| Method | Input | Output | Mô tả |
|---|---|---|---|
| `getOverallStats()` | — | `OverallStats` | Tổng số users, exams, lượt thi, tỷ lệ hoàn thành |
| `getStatsByExam(examId)` | string | `ExamStats` | Thống kê theo kỳ thi cụ thể |
| `getScoreDistribution(results)` | `ExamResult[]` | `number[]` | Phân phối điểm theo khoảng (0-2, 2-4, ...) |
| `filterResults(examId, startDate, endDate)` | string?, Date?, Date? | `ExamResult[]` | Lọc kết quả theo tiêu chí |
| `getAverageScore(results)` | `ExamResult[]` | number | Điểm trung bình |
| `getCompletionRate(results)` | `ExamResult[]` | number | Tỷ lệ hoàn thành (%) |

---

## Data Types

```javascript
// User
{ id, username, email, passwordHash, createdAt, role: 'user'|'admin' }

// Exam
{ id, name, description, type: 'free'|'scheduled', duration, startTime?, questions: Question[], createdAt }

// Question
{ id, text, options: string[4], correctAnswer: 0-3, explanation? }

// ExamSession (tạm thời, xóa sau khi nộp)
{ id, examId, userId, startTime, answers: number[], endTime? }

// ExamResult (lưu vĩnh viễn)
{ id, examId, userId, score, correct, total, answers: number[], submittedAt, duration }

// OverallStats
{ totalUsers, totalExams, totalAttempts, completionRate, averageScore }

// ExamStats
{ examId, examName, attempts, averageScore, completionRate, scoreDistribution: number[] }
```
