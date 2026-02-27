# Requirements Document — Hệ Thống Trắc Nghiệm Trực Tuyến (PTIT)

## Intent Analysis Summary

| Thuộc tính | Giá trị |
|---|---|
| **Loại yêu cầu** | New Project (Greenfield) |
| **Phạm vi** | Multiple Components (9 trang) |
| **Độ phức tạp** | Moderate |
| **Tech Stack** | HTML + CSS thuần + JavaScript |
| **Lưu trữ** | localStorage |
| **Màu sắc** | PTIT Đỏ (#C0282D) + Trắng/Xám |
| **Biểu đồ** | Chart.js (CDN) |
| **Excel Import** | SheetJS/xlsx.js (thật) |
| **PDF Export** | jsPDF (thật) |
| **Mock Data** | 1 kỳ thi, ~10 câu hỏi, 5 sinh viên |
| **CSS Framework** | CSS thuần (không framework) |
| **Validation** | Cơ bản (trống, email format, password match) |

---

## 1. Functional Requirements

### 1.1 Hệ thống Xác thực

#### FR-AUTH-01: Trang Đăng Nhập (Người Dùng)
- Form đăng nhập gồm: Tên đăng nhập, Mật khẩu
- Nút "Đăng nhập" và link chuyển sang "Đăng ký"
- Validation JS: kiểm tra trường không rỗng
- Demo: kiểm tra credentials với dữ liệu mẫu trong localStorage
- Sau đăng nhập thành công → chuyển sang Trang Chính

#### FR-AUTH-02: Trang Đăng Ký (Người Dùng)
- Form đăng ký gồm: Tên người dùng, Email, Mật khẩu, Xác nhận mật khẩu
- Validation JS cơ bản: trường không rỗng, email format hợp lệ, password == confirm password
- Lưu tài khoản mới vào localStorage
- Sau đăng ký thành công → chuyển sang Trang Đăng Nhập

#### FR-AUTH-03: Trang Đăng Nhập Admin
- Form đăng nhập riêng dành cho Admin
- Credentials admin cố định trong code hoặc localStorage
- Sau đăng nhập → chuyển sang Dashboard Admin

---

### 1.2 Người Dùng Thông Thường

#### FR-USER-01: Trang Chính
- Hiển thị danh sách các kỳ thi (Luyện tập, Giữa kỳ, Cuối kỳ, v.v.)
- Mỗi kỳ thi hiển thị: tên, loại, trạng thái (tự do / yêu cầu thời gian)
- Tính năng tìm kiếm theo tên kỳ thi
- Tính năng lọc theo trạng thái kỳ thi
- Nút "Bắt đầu thi" cho mỗi kỳ thi khả dụng
- Header với thông tin người dùng đang đăng nhập + nút Đăng xuất

#### FR-USER-02: Trang Bài Thi
- Hiển thị từng câu hỏi với 4 lựa chọn (A, B, C, D)
- Navigation giữa các câu hỏi (nút Trước / Tiếp)
- Panel navigator tổng quan tất cả câu hỏi (đã trả lời / chưa trả lời)
- Bộ đếm thời gian đếm ngược, hiển thị nổi bật
- Cảnh báo khi còn 5 phút
- Nút "Nộp bài" với confirm dialog
- Tự động nộp bài khi hết giờ
- Lưu đáp án vào localStorage

#### FR-USER-03: Trang Kết Quả
- Hiển thị: số câu đúng / tổng số câu, điểm số (thang 10)
- Thống kê: tỷ lệ đúng (%), thời gian làm bài
- Biểu đồ: phân phối câu đúng/sai theo chủ đề hoặc phần (Chart.js)
- Danh sách từng câu: câu hỏi, đáp án sinh viên, đáp án đúng, highlight đúng/sai
- Nút "Xem lại bài" và "Về trang chính"

---

### 1.3 Admin

#### FR-ADMIN-01: Dashboard Admin
- Tổng quan: tổng số người dùng, tổng số kỳ thi, tổng lượt thi
- Danh sách kỳ thi với: tên, số lượt tham gia, điểm TB, trạng thái
- Danh sách người dùng với: tên, email, số lần thi
- Hành động nhanh: thêm kỳ thi, thêm người dùng
- Charts: biểu đồ thống kê tổng quan (Chart.js)

#### FR-ADMIN-02: Trang Tạo/Chỉnh Sửa Kỳ Thi
- Form nhập: tên kỳ thi, mô tả, loại (tự do / thời gian cụ thể), thời lượng (phút)
- Danh sách câu hỏi trong kỳ thi
- Thêm câu hỏi: nhập câu hỏi + 4 lựa chọn + đáp án đúng + giải thích (optional)
- Chỉnh sửa, xóa từng câu hỏi
- **Upload file Excel** (SheetJS/xlsx.js): parse và import câu hỏi theo format chuẩn
- Lưu/cập nhật kỳ thi vào localStorage

#### FR-ADMIN-03: Trang Thống Kê
- Bảng tổng hợp: tất cả lượt thi, theo kỳ thi
- Thống kê: tổng lượt thi, tỷ lệ hoàn thành, điểm TB, phân phối điểm
- Biểu đồ phân phối điểm (Chart.js: bar chart / pie chart)
- Bộ lọc: theo kỳ thi, theo khoảng thời gian
- **Xuất PDF** (jsPDF): báo cáo thống kê
- Dữ liệu có thể fix (mock data)

#### FR-ADMIN-04: Trang Xem Kết Quả Sinh Viên
- Tìm kiếm sinh viên theo tên hoặc mã số
- Danh sách kỳ thi đã tham gia: tên kỳ thi, điểm, trạng thái, thời gian
- Chi tiết kết quả: câu hỏi, đáp án sinh viên, đáp án đúng, giải thích
- **Xuất báo cáo** kết quả sinh viên dạng in được (jsPDF)
- Dữ liệu có thể fix (mock data)

---

## 2. Non-Functional Requirements

### NFR-01: Giao Diện & UX
- Màu sắc PTIT chính thức: Đỏ (#C0282D) làm màu chủ đạo, Trắng (#FFFFFF), Xám (#F5F5F5, #666666)
- Font chữ: sans-serif chuẩn, dễ đọc
- Responsive design: hỗ trợ mobile, tablet, desktop
- CSS thuần (không Bootstrap, không Tailwind)
- Header/Navbar nhất quán trên tất cả các trang

### NFR-02: Hiệu Năng
- Tất cả code client-side, không cần server
- Tải trang nhanh, không phụ thuộc mạng (ngoài CDN thư viện)
- localStorage đủ cho dữ liệu demo

### NFR-03: Bảo Mật (Demo Level)
- Kiểm tra session login (redirect nếu chưa đăng nhập)
- Admin và User có session riêng biệt
- Không cần mã hóa thật (demo frontend)

### NFR-04: Khả Năng Bảo Trì
- Tách biệt: HTML (cấu trúc), CSS (style), JS (logic)
- Mock data trong file riêng (`data/mock-data.js`)
- Comment code đầy đủ

---

## 3. Thư Viện Bên Ngoài (CDN)

| Thư viện | Mục đích | Source |
|---|---|---|
| Chart.js | Biểu đồ thống kê | CDN |
| SheetJS (xlsx.js) | Đọc file Excel import câu hỏi | CDN |
| jsPDF | Xuất báo cáo PDF | CDN |

---

## 4. Mock Data Tối Thiểu

- **1 kỳ thi**: "Luyện tập Mạng Máy Tính" — 10 câu hỏi trắc nghiệm
- **5 sinh viên** mẫu với kết quả thi
- **1 admin** account mặc định

---

## 5. Cấu Trúc Trang (9 trang)

### Người Dùng (4 trang)
| Trang | File |
|---|---|
| Đăng Nhập / Đăng Ký | `login.html` / `register.html` |
| Trang Chính | `index.html` |
| Bài Thi | `exam.html` |
| Kết Quả | `result.html` |

### Admin (5 trang)
| Trang | File |
|---|---|
| Đăng Nhập Admin | `admin/login.html` |
| Dashboard | `admin/dashboard.html` |
| Tạo/Chỉnh sửa Kỳ thi | `admin/exam-editor.html` |
| Thống Kê | `admin/statistics.html` |
| Kết Quả Sinh Viên | `admin/student-results.html` |

---

## 6. Cấu Trúc Thư Mục Dự Án

```
HeThongTracNghiem/
├── index.html
├── login.html
├── register.html
├── exam.html
├── result.html
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── exam-editor.html
│   ├── statistics.html
│   └── student-results.html
├── css/
│   ├── main.css
│   ├── auth.css
│   ├── exam.css
│   └── admin.css
├── js/
│   ├── auth.js
│   ├── main.js
│   ├── exam.js
│   ├── result.js
│   └── admin/
│       ├── dashboard.js
│       ├── exam-editor.js
│       ├── statistics.js
│       └── student-results.js
└── data/
    └── mock-data.js
```
