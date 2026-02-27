# Components — Hệ Thống Trắc Nghiệm Trực Tuyến

## Overview

Ứng dụng gồm **10 Page Components** và **6 Shared Services**.

```
+--------------------------------------------------+
|              SHARED SERVICES LAYER               |
|  AuthService | DataService | ExamService         |
|  ImportService | ExportService | StatisticsService|
+--------------------------------------------------+
       |              |              |
+------+------+ +-----+------+ +----+-------+
| USER PAGES  | | ADMIN PAGES| | SHARED DATA|
+-------------+ +------------+ +------------+
```

---

## Page Components

### PC-01: LoginPage (`login.html` + `js/auth.js`)
**Purpose**: Cho phép sinh viên đăng nhập vào hệ thống.

**Responsibilities**:
- Render form đăng nhập (username + password)
- Validate input phía client (trường không rỗng)
- Gọi AuthService.login() và xử lý kết quả
- Redirect sang ExamListPage khi đăng nhập thành công
- Hiển thị link chuyển sang RegisterPage

---

### PC-02: RegisterPage (`register.html` + `js/auth.js`)
**Purpose**: Cho phép sinh viên tự tạo tài khoản.

**Responsibilities**:
- Render form đăng ký (username, email, password, confirm password)
- Validate: trường không rỗng, email format, password == confirmPassword
- Gọi AuthService.register() và lưu user vào DataService
- Redirect sang LoginPage sau đăng ký thành công

---

### PC-03: ExamListPage (`index.html` + `js/main.js`)
**Purpose**: Trang chính — hiển thị danh sách kỳ thi, tìm kiếm, lọc.

**Responsibilities**:
- Kiểm tra session (guard: chưa login → redirect LoginPage)
- Load và render danh sách kỳ thi từ DataService
- Tìm kiếm realtime theo tên kỳ thi
- Lọc theo loại kỳ thi (tự do / có lịch)
- Disable nút "Bắt đầu" cho kỳ thi chưa đến giờ, hiển thị giờ mở đề
- Điều hướng sang ExamPage khi chọn kỳ thi

---

### PC-04: ExamPage (`exam.html` + `js/exam.js`)
**Purpose**: Trang làm bài thi — hiển thị câu hỏi, timer, navigator.

**Responsibilities**:
- Kiểm tra session và load thông tin kỳ thi từ DataService
- Render câu hỏi hiện tại với 4 lựa chọn
- Quản lý trạng thái đáp án đã chọn (in-memory + localStorage)
- Hiển thị countdown timer; cảnh báo khi ≤ 5 phút
- Tự động submit khi hết giờ; điều hướng sang ResultPage
- Render question navigator (màu theo trạng thái đã làm / chưa)
- Xử lý nộp bài thủ công qua confirm dialog

---

### PC-05: ResultPage (`result.html` + `js/result.js`)
**Purpose**: Hiển thị kết quả bài thi và review đáp án.

**Responsibilities**:
- Load kết quả thi từ DataService (lưu bởi ExamPage)
- Hiển thị: số câu đúng/tổng, điểm (thang 10), thời gian làm
- Render biểu đồ phân phối đúng/sai bằng Chart.js
- Render danh sách review từng câu (đúng/sai, highlight màu)
- Hiển thị giải thích nếu câu có explanation

---

### PC-06: AdminLoginPage (`admin/login.html` + `js/admin/auth.js`)
**Purpose**: Trang đăng nhập riêng cho admin.

**Responsibilities**:
- Render form đăng nhập admin
- Xác thực credentials admin (hardcoded hoặc từ DataService)
- Lưu admin session vào localStorage
- Redirect sang AdminDashboardPage khi thành công

---

### PC-07: AdminDashboardPage (`admin/dashboard.html` + `js/admin/dashboard.js`)
**Purpose**: Tổng quan hệ thống — metrics và quick actions.

**Responsibilities**:
- Kiểm tra admin session (guard: không phải admin → trang 403)
- Load và hiển thị: tổng users, tổng kỳ thi, tổng lượt thi
- Render biểu đồ tổng quan bằng Chart.js (StatisticsService)
- Hiển thị danh sách kỳ thi gần đây với số lượt thi, điểm TB
- Quick action: link đến ExamEditor, Statistics

---

### PC-08: AdminExamEditorPage (`admin/exam-editor.html` + `js/admin/exam-editor.js`)
**Purpose**: Tạo và chỉnh sửa kỳ thi, quản lý câu hỏi.

**Responsibilities**:
- Kiểm tra admin session
- Render form kỳ thi (tên, mô tả, loại, thời lượng)
- Thêm/sửa/xóa câu hỏi thủ công (form inline)
- Upload file Excel → gọi ImportService.parseExcelFile()
- Preview câu hỏi import trước khi lưu
- Lưu hoặc cập nhật kỳ thi vào DataService

---

### PC-09: AdminStatisticsPage (`admin/statistics.html` + `js/admin/statistics.js`)
**Purpose**: Thống kê tổng hợp kết quả thi.

**Responsibilities**:
- Kiểm tra admin session
- Load thống kê từ StatisticsService
- Render bảng tổng hợp và biểu đồ Chart.js (bar + pie)
- Bộ lọc theo kỳ thi và theo khoảng thời gian
- Gọi ExportService.exportStatsPDF() khi nhấn "Xuất PDF"

---

### PC-10: AdminStudentResultsPage (`admin/student-results.html` + `js/admin/student-results.js`)
**Purpose**: Tìm kiếm sinh viên và xem kết quả chi tiết.

**Responsibilities**:
- Kiểm tra admin session
- Tìm kiếm sinh viên theo tên hoặc mã số
- Hiển thị danh sách kỳ thi đã tham gia của sinh viên
- Xem chi tiết từng bài làm (câu hỏi, đáp án, giải thích)
- Gọi ExportService.exportStudentResultPDF() để xuất báo cáo

---

## Shared Services

| Service | File | Mô tả |
|---|---|---|
| AuthService | `js/auth.js` | Xác thực người dùng và admin |
| DataService | `js/data-service.js` | CRUD localStorage |
| ExamService | `js/exam-service.js` | Logic bài thi, tính điểm |
| ImportService | `js/import-service.js` | Parse file Excel (SheetJS) |
| ExportService | `js/export-service.js` | Xuất PDF (jsPDF) |
| StatisticsService | `js/statistics-service.js` | Tổng hợp và thống kê |
| MockData | `data/mock-data.js` | Dữ liệu mẫu khởi tạo |
