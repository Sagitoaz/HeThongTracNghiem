# Phân Công Công Việc - Hệ Thống Thi Trắc Nghiệm

> Mỗi thành viên tự code phiên bản **siêu đơn giản** của các trang được giao.  
> Code để vào thư mục `codechay/` theo cấu trúc bên dưới.  
> Các trang liên quan được giao cho cùng một người để dễ liên kết với nhau.

---

## Thành Viên 1 — Trang Đăng Nhập & Đăng Ký

**Số trang:** 2

| Trang | File gợi ý |
|---|---|
| Đăng nhập người dùng | `codechay/tv1/login.html` |
| Đăng ký người dùng | `codechay/tv1/register.html` |
| Đăng nhập Admin | `codechay/tv1/admin-login.html` |

**Yêu cầu tối giản:**
- Form đăng nhập: 2 trường (tên đăng nhập, mật khẩu) + nút đăng nhập
- Form đăng ký: 4 trường (tên, email, mật khẩu, xác nhận mật khẩu) + nút đăng ký
- Validate cơ bản bằng JavaScript (không được để trống, mật khẩu khớp nhau)
- Sau đăng nhập thành công → chuyển hướng sang trang chính (`index.html`)
- Trang admin login → chuyển hướng sang dashboard admin (`admin-dashboard.html`)

---

## Thành Viên 2 — Trang Chính & Trang Bài Thi

**Số trang:** 2

| Trang | File gợi ý |
|---|---|
| Trang chính (danh sách đề thi) | `codechay/tv2/index.html` |
| Trang làm bài thi | `codechay/tv2/exam.html` |

**Yêu cầu tối giản:**
- Trang chính: hiển thị danh sách 3–5 đề thi (fix cứng dữ liệu), có ô tìm kiếm đơn giản, nút "Bắt đầu thi" → chuyển sang `exam.html`
- Trang bài thi: hiển thị từng câu hỏi trắc nghiệm (fix cứng 5–10 câu), đồng hồ đếm ngược, nút "Nộp bài" → chuyển sang `result.html`
- Dữ liệu câu hỏi viết thẳng trong JavaScript hoặc một mảng trong file

---

## Thành Viên 3 — Trang Kết Quả & Xem Kết Quả Sinh Viên (Admin)

**Số trang:** 2

| Trang | File gợi ý |
|---|---|
| Trang kết quả người dùng | `codechay/tv3/result.html` |
| Trang xem kết quả sinh viên (Admin) | `codechay/tv3/student-results.html` |

**Yêu cầu tối giản:**
- Trang kết quả: hiển thị số câu đúng/tổng số câu, điểm số, liệt kê lại câu hỏi + đáp án đúng/sai (fix cứng hoặc lấy từ `localStorage`)
- Trang xem kết quả sinh viên (admin): bảng danh sách sinh viên (fix cứng 5–10 dòng), có ô tìm kiếm theo tên/mã SV, click vào từng sinh viên để xem chi tiết điểm các bài thi

---

## Thành Viên 4 — Dashboard Admin, Tạo/Sửa Đề Thi & Thống Kê

**Số trang:** 3

| Trang | File gợi ý |
|---|---|
| Dashboard Admin | `codechay/tv4/admin-dashboard.html` |
| Tạo / Chỉnh sửa kỳ thi | `codechay/tv4/exam-editor.html` |
| Thống kê | `codechay/tv4/statistics.html` |

**Yêu cầu tối giản:**
- Dashboard: hiển thị số liệu tổng quan (số đề thi, số người dùng — fix cứng), bảng danh sách đề thi với nút Thêm/Sửa/Xóa (xóa thực hiện được bằng JS, thêm/sửa chuyển sang `exam-editor.html`)
- Trang tạo/sửa đề thi: form nhập tên đề, mô tả, loại đề; danh sách câu hỏi có thể thêm/xóa từng câu bằng JS
- Trang thống kê: bảng thống kê fix cứng (tổng lượt thi, điểm TB, tỷ lệ hoàn thành), biểu đồ đơn giản (có thể dùng `<progress>` hoặc thư viện Chart.js)

---

## Cấu Trúc Thư Mục Đề Xuất

```
codechay/
├── README.md          ← hướng dẫn chung
├── tv1/               ← code của thành viên 1
│   ├── login.html
│   ├── register.html
│   └── admin-login.html
├── tv2/               ← code của thành viên 2
│   ├── index.html
│   └── exam.html
├── tv3/               ← code của thành viên 3
│   ├── result.html
│   └── student-results.html
└── tv4/               ← code của thành viên 4
    ├── admin-dashboard.html
    ├── exam-editor.html
    └── statistics.html
```

---

## Lưu Ý Chung

- Code **siêu đơn giản**: không cần framework, không cần backend, dùng HTML + CSS + JS thuần
- Dữ liệu **fix cứng** (hardcode) trong JS hoặc dùng `localStorage` để truyền giữa các trang
- CSS có thể viết inline hoặc trong thẻ `<style>`, không cần file riêng
- Ưu tiên **chạy được, liên kết được** hơn là đẹp
- Liên kết giữa các trang dùng đường dẫn tương đối (ví dụ: `../tv2/index.html`)
