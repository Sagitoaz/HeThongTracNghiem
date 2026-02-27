# Services — Hệ Thống Trắc Nghiệm Trực Tuyến

## Service Architecture Overview

```
+----------------------------------------------------------+
|                    PAGE COMPONENTS                        |
|  (login, register, index, exam, result, admin/*)          |
+----------------------------------------------------------+
          |         |        |         |         |
     AuthService  DataService ExamService ImportService ExportService
          |         |        |                    |
          +----+----+        |           StatisticsService
               |             |                    |
          localStorage    localStorage        localStorage
```

---

## SS-01: AuthService (`js/auth.js`)

**Purpose**: Quản lý toàn bộ vòng đời xác thực người dùng và admin.

**Responsibilities**:
- Xác thực credentials so với dữ liệu trong DataService
- Quản lý user session trong `localStorage['currentUser']`
- Quản lý admin session trong `localStorage['adminUser']`
- Cung cấp route guards: `guardUserPage()` và `guardAdminPage()`
- Cung cấp trang 403 inline khi admin guard thất bại

**Interactions**:
- Gọi `DataService.getUserByUsername()` để xác thực user
- Đọc/ghi `localStorage['currentUser']` và `localStorage['adminUser']`
- Được gọi bởi tất cả PageComponents khi cần auth

**Session Schema**:
```javascript
localStorage['currentUser'] = JSON.stringify({ id, username, email, role })
localStorage['adminUser']   = JSON.stringify({ id, username, role: 'admin' })
```

---

## SS-02: DataService (`js/data-service.js`)

**Purpose**: Lớp truy cập dữ liệu trung tâm — toàn bộ đọc/ghi localStorage đi qua đây.

**Responsibilities**:
- Khởi tạo localStorage với mock data từ `data/mock-data.js` nếu chưa có
- CRUD operations cho 3 collections: `users`, `exams`, `results`
- Serialize/deserialize JSON khi đọc ghi localStorage
- Tạo ID tự động (UUID-like bằng `Date.now() + Math.random()`)

**Interactions**:
- Được import bởi mọi service và component khác cần dữ liệu
- Gọi `MockData` một lần duy nhất khi `init()` lần đầu

**LocalStorage Keys**:
```javascript
'httn_users'    // User[]
'httn_exams'    // Exam[]
'httn_results'  // ExamResult[]
'httn_initialized' // boolean — đánh dấu đã seed mock data
```

---

## SS-03: ExamService (`js/exam-service.js`)

**Purpose**: Điều phối toàn bộ luồng nghiệp vụ của bài thi.

**Responsibilities**:
- Lọc kỳ thi khả dụng (so sánh `exam.type` + `exam.startTime` với `Date.now()`)
- Tạo và quản lý `ExamSession` tạm thời trong localStorage
- Lưu đáp án từng câu theo thời gian thực
- Tính điểm khi nộp bài và tạo `ExamResult`
- Xóa `ExamSession` sau khi nộp bài

**Interactions**:
- Gọi `DataService.getExamById()`, `DataService.saveResult()`
- Gọi bởi ExamPage và ExamListPage

**Session LocalStorage Key**:
```javascript
'httn_exam_session' // ExamSession (tạm thời, xóa sau submit)
```

---

## SS-04: ImportService (`js/import-service.js`)

**Purpose**: Parse file Excel thành danh sách câu hỏi dùng SheetJS.

**Responsibilities**:
- Đọc file `.xlsx` / `.xls` từ `<input type="file">`
- Dùng SheetJS `XLSX.read()` để parse workbook
- Validate format (đủ 7 cột, cột F là số 0-3)
- Chuyển đổi mỗi hàng thành `Question` object
- Trả về preview để AdminExamEditorPage hiển thị trước khi lưu

**Dependencies**: `xlsx` (SheetJS CDN)

---

## SS-05: ExportService (`js/export-service.js`)

**Purpose**: Tạo và download file PDF từ dữ liệu thống kê.

**Responsibilities**:
- Dùng jsPDF để tạo PDF layout đơn giản
- `exportStatsPDF()`: Tiêu đề + bảng thống kê + phân phối điểm
- `exportStudentResultPDF()`: Thông tin SV + danh sách kỳ thi + chi tiết đáp án
- Trigger browser download với tên file có timestamp

**Dependencies**: `jspdf` (CDN)

---

## SS-06: StatisticsService (`js/statistics-service.js`)

**Purpose**: Tổng hợp và phân tích dữ liệu kết quả thi.

**Responsibilities**:
- Tổng hợp `OverallStats` từ toàn bộ results
- Nhóm kết quả theo `examId` cho thống kê per-exam
- Tính phân phối điểm theo 5 khoảng: 0-2, 2-4, 4-6, 6-8, 8-10
- Hỗ trợ lọc theo examId và khoảng thời gian
- Cung cấp data đã format sẵn cho Chart.js

**Interactions**:
- Gọi `DataService.getResults()`, `DataService.getExams()`, `DataService.getUsers()`
- Gọi bởi AdminDashboardPage, AdminStatisticsPage

---

## MockData (`data/mock-data.js`)

**Purpose**: Seed data ban đầu cho localStorage khi ứng dụng chạy lần đầu.

**Content**:
- 1 admin account: `{ username: 'admin', password: 'admin123' }`
- 5 sinh viên mẫu với tài khoản
- 1 kỳ thi "Luyện tập Mạng Máy Tính" với 10 câu hỏi trắc nghiệm
- 5 kết quả thi mẫu (mỗi sinh viên 1 lần thi)

**Export**: `window.MockData = { users, exams, results }`
