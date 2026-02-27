# Unit of Work — Story Map

Ánh xạ 19 User Stories → 5 Units

## UNIT-01: Shared Foundation

| Story ID | Story | Artifact |
|---|---|---|
| (no direct stories) | Nền tảng kỹ thuật, không map trực tiếp với user-visible stories | `mock-data.js`, `data-service.js`, `auth.js`, `main.css` |

---

## UNIT-02: Authentication

| Story ID | Story | Files |
|---|---|---|
| US-01 | Đăng nhập sinh viên | `login.html` |
| US-02 | Đăng ký tài khoản sinh viên | `register.html` |
| US-03 | Đăng nhập Admin | `admin/login.html` |
| US-04 | Bảo vệ trang Admin (403) | `auth.js` (guard), inline 403 page |

---

## UNIT-03: User — Exam Flow

| Story ID | Story | Files |
|---|---|---|
| US-05 | Xem danh sách kỳ thi | `index.html`, `js/main.js` |
| US-06 | Tìm kiếm và lọc kỳ thi | `index.html`, `js/main.js` |
| US-07 | Làm bài thi trắc nghiệm | `exam.html`, `js/exam.js`, `js/exam-service.js` |
| US-08 | Navigator câu hỏi | `exam.html`, `js/exam.js` |
| US-09 | Nộp bài và hết giờ | `exam.html`, `js/exam.js`, `js/exam-service.js` |
| US-10 | Xem kết quả sau khi thi | `result.html`, `js/result.js` |
| US-11 | Xem lại đáp án chi tiết | `result.html`, `js/result.js` |

---

## UNIT-04: Admin — Core Management

| Story ID | Story | Files |
|---|---|---|
| US-12 | Xem tổng quan hệ thống (Dashboard) | `admin/dashboard.html`, `js/admin/dashboard.js` |
| US-13 | Tạo kỳ thi mới | `admin/exam-editor.html`, `js/admin/exam-editor.js` |
| US-14 | Import câu hỏi từ Excel | `admin/exam-editor.html`, `js/import-service.js` |
| US-15 | Chỉnh sửa / Xóa kỳ thi | `admin/exam-editor.html`, `js/admin/exam-editor.js` |

---

## UNIT-05: Admin — Reports & Statistics

| Story ID | Story | Files |
|---|---|---|
| US-16 | Xem thống kê tổng hợp | `admin/statistics.html`, `js/statistics-service.js` |
| US-17 | Xuất báo cáo PDF (thống kê) | `js/export-service.js`, `admin/statistics.html` |
| US-18 | Tìm và xem kết quả sinh viên | `admin/student-results.html`, `js/admin/student-results.js` |
| US-19 | Xem chi tiết bài làm + xuất PDF | `admin/student-results.html`, `js/export-service.js` |

---

## Coverage Summary

| Unit | Stories | Tổng |
|---|---|---|
| UNIT-01 Foundation | (base infrastructure) | 0 direct |
| UNIT-02 Auth | US-01, 02, 03, 04 | 4 |
| UNIT-03 User Flow | US-05, 06, 07, 08, 09, 10, 11 | 7 |
| UNIT-04 Admin Core | US-12, 13, 14, 15 | 4 |
| UNIT-05 Admin Reports | US-16, 17, 18, 19 | 4 |
| **Tổng** | | **19 / 19** ✅ |

Tất cả 19 user stories đều được cover, không có story nào bị bỏ sót.
