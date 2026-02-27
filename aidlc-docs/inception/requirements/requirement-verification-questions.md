# Requirements Clarification Questions — Hệ Thống Trắc Nghiệm Trực Tuyến

Vui lòng điền câu trả lời vào các thẻ [Answer]: bên dưới mỗi câu hỏi.

---

## Question 1
Dữ liệu trong ứng dụng sẽ được lưu trữ như thế nào? (Không có backend theo yêu cầu)

A) localStorage của trình duyệt (dữ liệu tồn tại giữa các lần refresh)
B) Dữ liệu cố định (hardcoded/mock data trong JS file, reset khi refresh)
C) Kết hợp: mock data mặc định + localStorage để lưu thay đổi
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Về bộ màu sắc PTIT, bạn muốn sử dụng tông màu nào?

A) Đỏ chủ đạo (#C0282D - màu đỏ PTIT chính thức) kết hợp trắng/xám
B) Xanh dương đậm (#003087) kết hợp đỏ làm accent
C) Tham khảo website PTIT hiện tại (ptit.edu.vn) để lấy màu chính xác
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3
Biểu đồ thống kê (trang Kết Quả và trang Thống Kê Admin) sẽ dùng thư viện nào?

A) Chart.js (phổ biến, dễ dùng, CDN)
B) ApexCharts (đẹp hơn, nhiều loại biểu đồ)
C) Chỉ cần bảng số liệu đơn giản, không cần biểu đồ tương tác
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
Tính năng **nhập đề thi từ file Excel** trong trang Admin cần ở mức độ nào?

A) Chỉ cần UI (nút upload + hiển thị preview giả), không cần xử lý file thật
B) Cần xử lý file Excel thật (dùng SheetJS/xlsx.js)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 5
Tính năng **xuất báo cáo PDF/Excel** trong trang Thống Kê Admin cần ở mức độ nào?

A) Chỉ cần UI (nút xuất), không cần chức năng thật
B) Cần xuất PDF thật (dùng jsPDF)
C) Cần xuất Excel thật (dùng SheetJS)
D) Cần cả PDF lẫn Excel thật
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 6
Số lượng dữ liệu mẫu (mock data) cần thiết cho demo?

A) Tối thiểu: 1 kỳ thi, ~10 câu hỏi, 5 sinh viên mẫu
B) Vừa đủ: 3 kỳ thi (Luyện tập/Giữa kỳ/Cuối kỳ), ~20 câu hỏi mỗi kỳ, 10 sinh viên
C) Đầy đủ: 5+ kỳ thi, 30+ câu hỏi mỗi kỳ, 20+ sinh viên, nhiều kết quả đa dạng
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
Bạn có muốn tích hợp **framework CSS** nào để tăng tốc độ phát triển không?

A) Không — viết CSS thuần hoàn toàn (đúng yêu cầu "viết manually")
B) Bootstrap 5 (CDN, responsive sẵn)
C) Tailwind CSS (utility-first)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
Trang đăng nhập/đăng ký: validation bằng JavaScript cần ở mức độ nào?

A) Chỉ validate cơ bản: trường không rỗng, email format, password match
B) Validate đầy đủ: độ dài mật khẩu, ký tự đặc biệt, tên người dùng hợp lệ + feedback rõ ràng
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---
