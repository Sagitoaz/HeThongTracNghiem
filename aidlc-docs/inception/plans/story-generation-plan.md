# Story Generation Plan — Hệ Thống Trắc Nghiệm Trực Tuyến

## Execution Checklist

- [x] Step 1: Xác định personas (Sinh Viên, Admin)
- [x] Step 2: Tạo `personas.md` cho từng persona
- [x] Step 3: Tạo User Stories cho Sinh Viên (Đăng nhập, Trang chính, Bài thi, Kết quả)
- [x] Step 4: Tạo User Stories cho Admin (Đăng nhập, Dashboard, Quản lý kỳ thi, Thống kê, Kết quả SV)
- [x] Step 5: Ghi acceptance criteria cho mỗi story
- [x] Step 6: Lưu `stories.md` và `personas.md`

---

## Câu hỏi làm rõ cho Story Planning

Vui lòng điền câu trả lời vào các thẻ `[Answer]:` bên dưới.

---

### Question 1
Bạn muốn tổ chức User Stories theo cách nào?

A) **Feature-Based** — Nhóm theo tính năng (Auth, Danh sách kỳ thi, Bài thi, Kết quả, Admin CRUD...)
B) **Persona-Based** — Nhóm theo người dùng (Tất cả stories của Sinh Viên / Tất cả của Admin)
C) **User Journey-Based** — Nhóm theo luồng hoàn chỉnh (Luồng thi từ đầu đến cuối)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2
Mức độ chi tiết của Acceptance Criteria trong mỗi story?

A) **Ngắn gọn** — 2-3 tiêu chí đơn giản "Given/When/Then" là đủ
B) **Đầy đủ** — Liệt kê đầy đủ happy path + edge cases (hết giờ, trường rỗng, v.v.)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3
Đối với tính năng **bộ đếm thời gian** trong trang Bài Thi, khi hết giờ hệ thống nên xử lý như thế nào?

A) Tự động nộp bài và chuyển thẳng sang trang Kết Quả
B) Hiển thị thông báo "Hết giờ" rồi sau 3 giây tự chuyển sang Kết Quả
C) Hiển thị dialog "Hết giờ!" — sinh viên bấm OK mới chuyển sang Kết Quả
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4
Đối với **phân quyền trang Admin**, khi người dùng thường cố truy cập URL `/admin/...` nên xảy ra điều gì?

A) Redirect về trang đăng nhập Admin
B) Redirect về trang chủ người dùng thường với thông báo "Không có quyền truy cập"
C) Hiển thị trang 403 đơn giản
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 5
Kỳ thi **"yêu cầu thời gian cụ thể"** (không phải tự do) — khi sinh viên cố mở trước thời gian cho phép, UI nên hiển thị gì?

A) Nút "Bắt đầu thi" bị disable + hiển thị thời gian mở đề (ví dụ: "Mở lúc 09:00")
B) Kỳ thi bị ẩn khỏi danh sách cho đến khi đến giờ
C) Nút "Bắt đầu thi" vẫn hiện nhưng khi bấm hiện thông báo "Chưa đến giờ thi"
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---
