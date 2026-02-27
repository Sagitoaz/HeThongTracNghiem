# Unit of Work — Hệ Thống Trắc Nghiệm Trực Tuyến

## Deployment Model
**Single-repo Static Site** — Tất cả 5 units cùng nằm trong một thư mục, không có server.  
Triển khai bằng cách mở `index.html` trong trình duyệt.

## Code Organization Strategy
```
HeThongTracNghiem/          ← Workspace root (APPLICATION CODE)
├── data/
│   └── mock-data.js        ← Unit 1 (Shared Foundation)
├── css/
│   ├── main.css            ← Unit 1
│   ├── auth.css            ← Unit 2
│   ├── exam.css            ← Unit 3
│   └── admin.css           ← Unit 4 + 5
├── js/
│   ├── data-service.js     ← Unit 1
│   ├── auth.js             ← Unit 1 + 2
│   ├── exam-service.js     ← Unit 3
│   ├── result.js           ← Unit 3
│   ├── main.js             ← Unit 3
│   ├── import-service.js   ← Unit 4
│   ├── export-service.js   ← Unit 4 + 5
│   ├── statistics-service.js ← Unit 5
│   └── admin/
│       ├── dashboard.js    ← Unit 4
│       ├── exam-editor.js  ← Unit 4
│       ├── statistics.js   ← Unit 5
│       └── student-results.js ← Unit 5
├── index.html              ← Unit 3
├── login.html              ← Unit 2
├── register.html           ← Unit 2
├── exam.html               ← Unit 3
├── result.html             ← Unit 3
└── admin/
    ├── login.html          ← Unit 2
    ├── dashboard.html      ← Unit 4
    ├── exam-editor.html    ← Unit 4
    ├── statistics.html     ← Unit 5
    └── student-results.html ← Unit 5
```

---

## Unit 1: Shared Foundation

| Thuộc tính | Giá trị |
|---|---|
| **ID** | UNIT-01 |
| **Tên** | Shared Foundation |
| **Priority** | 1 — Build first (all other units depend on this) |
| **Complexity** | Simple |

**Responsibilities**:
- Thiết lập cấu trúc thư mục và file CSS chung
- Tạo `data/mock-data.js` với seed data khởi tạo (1 admin, 5 sinh viên, 1 kỳ thi, 10 câu hỏi, 5 kết quả)
- Xây dựng `js/data-service.js` — toàn bộ CRUD localStorage
- Xây dựng `js/auth.js` — session management, route guards
- Tạo `css/main.css` — global styles, màu PTIT (#C0282D), typography, responsive grid

**Files**:
- `data/mock-data.js`
- `js/data-service.js`
- `js/auth.js`
- `css/main.css`

**External Dependencies**: Không có

---

## Unit 2: Authentication

| Thuộc tính | Giá trị |
|---|---|
| **ID** | UNIT-02 |
| **Tên** | Authentication |
| **Priority** | 2 — After Shared Foundation |
| **Complexity** | Simple |

**Responsibilities**:
- Xây dựng trang đăng nhập sinh viên (`login.html`)
- Xây dựng trang đăng ký sinh viên (`register.html`)
- Xây dựng trang đăng nhập admin (`admin/login.html`)
- Form validation JS (trường rỗng, email format, password match)
- Trang 403 inline (hiển thị khi admin guard thất bại)

**Files**:
- `login.html`
- `register.html`
- `admin/login.html`
- `css/auth.css`

**Depends On**: Unit 1 (DataService, AuthService, main.css)

---

## Unit 3: User — Exam Flow

| Thuộc tính | Giá trị |
|---|---|
| **ID** | UNIT-03 |
| **Tên** | User Exam Flow |
| **Priority** | 3 — After Authentication |
| **Complexity** | Moderate |

**Responsibilities**:
- Trang Chính (`index.html`): danh sách kỳ thi, tìm kiếm, lọc, disable locked exams
- Trang Bài Thi (`exam.html`): câu hỏi, navigator, countdown timer, auto-submit
- Trang Kết Quả (`result.html`): điểm số, Chart.js biểu đồ, review đáp án
- `js/exam-service.js` — startExam, saveAnswer, submitExam, calculateScore
- `js/main.js`, `js/result.js`

**Files**:
- `index.html` + `js/main.js`
- `exam.html` + `js/exam.js`
- `result.html` + `js/result.js`
- `js/exam-service.js`
- `css/exam.css`

**Depends On**: Unit 1, Unit 2  
**External CDN**: Chart.js

---

## Unit 4: Admin — Core Management

| Thuộc tính | Giá trị |
|---|---|
| **ID** | UNIT-04 |
| **Tên** | Admin Core Management |
| **Priority** | 4 — Parallel với Unit 3 sau Unit 2 |
| **Complexity** | Moderate |

**Responsibilities**:
- Dashboard Admin (`admin/dashboard.html`): metrics tổng quan, Chart.js charts
- Trang Tạo/Chỉnh sửa Kỳ Thi (`admin/exam-editor.html`): CRUD exam + questions, import Excel
- `js/import-service.js` — SheetJS parsing, format validation
- `js/admin/dashboard.js`, `js/admin/exam-editor.js`

**Files**:
- `admin/dashboard.html` + `js/admin/dashboard.js`
- `admin/exam-editor.html` + `js/admin/exam-editor.js`
- `js/import-service.js`
- `css/admin.css`

**Depends On**: Unit 1, Unit 2  
**External CDN**: Chart.js, SheetJS (xlsx.js)

---

## Unit 5: Admin — Reports & Statistics

| Thuộc tính | Giá trị |
|---|---|
| **ID** | UNIT-05 |
| **Tên** | Admin Reports & Statistics |
| **Priority** | 5 — After Unit 4 |
| **Complexity** | Moderate |

**Responsibilities**:
- Trang Thống Kê (`admin/statistics.html`): bảng, biểu đồ Chart.js, filter, xuất PDF
- Trang Kết Quả Sinh Viên (`admin/student-results.html`): tìm kiếm SV, chi tiết, xuất PDF
- `js/statistics-service.js` — aggregate stats, score distribution, filtering
- `js/export-service.js` — jsPDF generation cho 2 loại báo cáo
- `js/admin/statistics.js`, `js/admin/student-results.js`

**Files**:
- `admin/statistics.html` + `js/admin/statistics.js`
- `admin/student-results.html` + `js/admin/student-results.js`
- `js/statistics-service.js`
- `js/export-service.js`

**Depends On**: Unit 1, Unit 2, Unit 4  
**External CDN**: Chart.js, jsPDF
