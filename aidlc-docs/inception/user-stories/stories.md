# User Stories — Hệ Thống Trắc Nghiệm Trực Tuyến (PTIT)

**Tổ chức**: Feature-Based  
**Acceptance Criteria**: Ngắn gọn (Given/When/Then)

---

## EPIC 1: Authentication (Xác Thực)

### US-01: Đăng nhập sinh viên
**As a** sinh viên,  
**I want to** đăng nhập bằng tên đăng nhập và mật khẩu,  
**So that** tôi có thể truy cập vào hệ thống thi.

**Acceptance Criteria:**
- **Given** tôi điền đúng tên đăng nhập và mật khẩu, **When** tôi bấm "Đăng nhập", **Then** tôi được chuyển đến Trang Chính.
- **Given** tôi để trống một trong hai trường, **When** tôi bấm "Đăng nhập", **Then** hiện thông báo lỗi tương ứng.
- **Given** tôi nhập sai credentials, **When** tôi bấm "Đăng nhập", **Then** hiện thông báo "Sai tên đăng nhập hoặc mật khẩu".

---

### US-02: Đăng ký tài khoản sinh viên
**As a** sinh viên mới,  
**I want to** tạo tài khoản với tên, email, mật khẩu,  
**So that** tôi có thể đăng nhập và tham gia thi.

**Acceptance Criteria:**
- **Given** tôi điền đầy đủ thông tin hợp lệ, **When** tôi bấm "Đăng ký", **Then** tài khoản được lưu và tôi được chuyển về trang đăng nhập.
- **Given** email không đúng định dạng, **When** tôi bấm "Đăng ký", **Then** hiện thông báo "Email không hợp lệ".
- **Given** mật khẩu và xác nhận mật khẩu không khớp, **When** tôi bấm "Đăng ký", **Then** hiện thông báo "Mật khẩu không khớp".

---

### US-03: Đăng nhập Admin
**As an** admin,  
**I want to** đăng nhập qua trang riêng dành cho admin,  
**So that** tôi có thể truy cập Dashboard quản trị.

**Acceptance Criteria:**
- **Given** tôi nhập đúng credentials admin, **When** tôi bấm "Đăng nhập", **Then** tôi được chuyển đến Dashboard Admin.
- **Given** tôi nhập sai credentials, **When** tôi bấm "Đăng nhập", **Then** hiện thông báo lỗi, không cho vào.

---

### US-04: Bảo vệ trang Admin (403)
**As a** sinh viên,  
**I want to** thấy thông báo lỗi rõ ràng khi cố truy cập trang Admin,  
**So that** tôi hiểu mình không có quyền truy cập vào khu vực đó.

**Acceptance Criteria:**
- **Given** tôi là sinh viên đã đăng nhập, **When** tôi cố truy cập URL `/admin/...`, **Then** hệ thống hiển thị trang 403 đơn giản.
- **Given** tôi chưa đăng nhập, **When** tôi truy cập bất kỳ trang nào cần auth, **Then** tôi bị redirect về trang đăng nhập.

---

## EPIC 2: Danh Sách Kỳ Thi

### US-05: Xem danh sách kỳ thi
**As a** sinh viên,  
**I want to** thấy danh sách tất cả kỳ thi,  
**So that** tôi biết có những đề nào để chọn.

**Acceptance Criteria:**
- **Given** tôi đã đăng nhập, **When** tôi vào Trang Chính, **Then** danh sách kỳ thi hiển thị với tên, loại, và trạng thái.
- **Given** kỳ thi là loại "tự do", **When** tôi thấy nó trong danh sách, **Then** nút "Bắt đầu thi" đang active.
- **Given** kỳ thi là loại "thời gian cụ thể" và chưa đến giờ, **When** tôi thấy nó, **Then** nút "Bắt đầu thi" bị disable và hiển thị giờ mở đề.

---

### US-06: Tìm kiếm và lọc kỳ thi
**As a** sinh viên,  
**I want to** tìm kiếm kỳ thi theo tên và lọc theo trạng thái,  
**So that** tôi nhanh chóng tìm được đề thi phù hợp.

**Acceptance Criteria:**
- **Given** tôi nhập từ khóa trong ô tìm kiếm, **When** tôi gõ, **Then** danh sách lọc realtime theo tên kỳ thi.
- **Given** tôi chọn bộ lọc trạng thái, **When** tôi chọn "Tự do" hoặc "Có lịch", **Then** chỉ hiển thị các kỳ thi thuộc loại đó.

---

## EPIC 3: Bài Thi

### US-07: Làm bài thi trắc nghiệm
**As a** sinh viên,  
**I want to** làm bài thi với đồng hồ đếm ngược,  
**So that** tôi có thể hoàn thành bài trong thời gian quy định.

**Acceptance Criteria:**
- **Given** tôi bắt đầu bài thi, **When** trang Bài Thi mở ra, **Then** câu hỏi đầu tiên và đồng hồ đếm ngược hiển thị ngay lập tức.
- **Given** tôi đang làm bài, **When** tôi chọn một đáp án, **Then** lựa chọn được highlight và được lưu tạm thời.
- **Given** tôi bấm "Tiếp theo" / "Trước đó", **When** di chuyển giữa các câu, **Then** đáp án đã chọn trước đó được giữ nguyên.

---

### US-08: Navigator câu hỏi
**As a** sinh viên,  
**I want to** thấy tổng quan tất cả câu hỏi và trạng thái (đã làm / chưa làm),  
**So that** tôi có thể theo dõi tiến trình và quay lại câu còn bỏ trống.

**Acceptance Criteria:**
- **Given** tôi đang thi, **When** tôi nhìn vào panel navigator, **Then** mỗi câu hỏi được thể hiện bằng một ô số, màu khác nhau cho đã làm / chưa làm.
- **Given** tôi bấm vào số câu trong navigator, **When** tôi click, **Then** tôi nhảy trực tiếp đến câu đó.

---

### US-09: Nộp bài và hết giờ
**As a** sinh viên,  
**I want to** nộp bài chủ động hoặc hệ thống tự nộp khi hết giờ,  
**So that** bài làm được ghi nhận đúng thời hạn.

**Acceptance Criteria:**
- **Given** tôi bấm "Nộp bài", **When** confirm dialog xuất hiện và tôi bấm "Xác nhận", **Then** bài được nộp và chuyển sang trang Kết Quả.
- **Given** đồng hồ đếm về 0, **When** hết giờ, **Then** hệ thống tự động nộp bài và chuyển thẳng sang trang Kết Quả.

---

## EPIC 4: Kết Quả

### US-10: Xem kết quả sau khi thi
**As a** sinh viên,  
**I want to** thấy điểm số và tỷ lệ đúng/sai sau khi nộp bài,  
**So that** tôi biết kết quả bài thi của mình.

**Acceptance Criteria:**
- **Given** bài đã được nộp, **When** trang Kết Quả mở, **Then** hiển thị số câu đúng / tổng số câu và điểm số (thang 10).
- **Given** trang Kết Quả, **When** tôi nhìn vào phần thống kê, **Then** biểu đồ Chart.js hiển thị phân phối đúng/sai.

---

### US-11: Xem lại đáp án chi tiết
**As a** sinh viên,  
**I want to** xem lại từng câu hỏi, đáp án tôi chọn, và đáp án đúng,  
**So that** tôi học được từ những câu sai.

**Acceptance Criteria:**
- **Given** tôi ở trang Kết Quả, **When** tôi cuộn xuống phần review, **Then** mỗi câu hỏi hiển thị: câu hỏi, đáp án tôi chọn (highlight đỏ nếu sai), đáp án đúng (highlight xanh).
- **Given** câu có giải thích, **When** hiển thị review, **Then** phần giải thích xuất hiện bên dưới đáp án đúng.

---

## EPIC 5: Admin — Dashboard

### US-12: Xem tổng quan hệ thống
**As an** admin,  
**I want to** thấy tổng quan nhanh về hệ thống ngay khi đăng nhập,  
**So that** tôi nắm được tình trạng chung.

**Acceptance Criteria:**
- **Given** tôi đăng nhập admin xong, **When** Dashboard mở, **Then** hiển thị: tổng số người dùng, tổng số kỳ thi, tổng lượt thi.
- **Given** Dashboard, **When** tôi nhìn vào phần charts, **Then** biểu đồ Chart.js thể hiện thống kê tổng quan.

---

## EPIC 6: Admin — Quản Lý Kỳ Thi

### US-13: Tạo kỳ thi mới
**As an** admin,  
**I want to** tạo kỳ thi mới với đầy đủ thông tin và câu hỏi,  
**So that** sinh viên có thể tham gia thi.

**Acceptance Criteria:**
- **Given** tôi điền đầy đủ tên, mô tả, loại, thời lượng, **When** tôi bấm "Lưu", **Then** kỳ thi được lưu vào localStorage và xuất hiện trong danh sách.
- **Given** tôi thêm câu hỏi thủ công (câu hỏi + 4 lựa chọn + đáp án đúng), **When** tôi bấm "Thêm câu hỏi", **Then** câu hỏi xuất hiện trong danh sách câu hỏi của kỳ thi.

---

### US-14: Import câu hỏi từ Excel
**As an** admin,  
**I want to** upload file Excel để import câu hỏi hàng loạt,  
**So that** tôi tiết kiệm thời gian nhập câu hỏi thủ công.

**Acceptance Criteria:**
- **Given** tôi upload file Excel đúng format, **When** file được parse bởi SheetJS, **Then** danh sách câu hỏi parse được hiển thị preview trước khi lưu.
- **Given** file Excel sai format, **When** parse thất bại, **Then** hiện thông báo lỗi rõ ràng với hướng dẫn format đúng.

---

### US-15: Chỉnh sửa / Xóa kỳ thi
**As an** admin,  
**I want to** chỉnh sửa hoặc xóa kỳ thi đã tạo,  
**So that** tôi có thể cập nhật nội dung hoặc dọn dẹp đề thi cũ.

**Acceptance Criteria:**
- **Given** tôi bấm "Chỉnh sửa" trên một kỳ thi, **When** form mở, **Then** thông tin cũ được điền sẵn để chỉnh sửa.
- **Given** tôi bấm "Xóa", **When** confirm dialog xuất hiện và tôi xác nhận, **Then** kỳ thi bị xóa khỏi danh sách và localStorage.

---

## EPIC 7: Admin — Thống Kê

### US-16: Xem thống kê tổng hợp
**As an** admin,  
**I want to** xem bảng thống kê tổng hợp kết quả tất cả sinh viên,  
**So that** tôi nắm được tình hình học tập chung.

**Acceptance Criteria:**
- **Given** tôi vào trang Thống Kê, **When** trang tải, **Then** hiển thị bảng và biểu đồ Chart.js với: tổng lượt thi, tỷ lệ hoàn thành, điểm TB, phân phối điểm.
- **Given** tôi chọn bộ lọc theo kỳ thi, **When** filter áp dụng, **Then** biểu đồ và bảng cập nhật theo kỳ thi đã chọn.

---

### US-17: Xuất báo cáo PDF
**As an** admin,  
**I want to** xuất báo cáo thống kê thành file PDF,  
**So that** tôi có thể lưu trữ hoặc in báo cáo.

**Acceptance Criteria:**
- **Given** tôi bấm "Xuất PDF", **When** jsPDF xử lý, **Then** file PDF được tải xuống với nội dung thống kê.

---

## EPIC 8: Admin — Kết Quả Sinh Viên

### US-18: Tìm và xem kết quả sinh viên
**As an** admin,  
**I want to** tìm kiếm sinh viên và xem kết quả thi chi tiết của họ,  
**So that** tôi có thể hỗ trợ sinh viên hoặc xác minh kết quả.

**Acceptance Criteria:**
- **Given** tôi nhập tên hoặc mã số SV, **When** tìm kiếm, **Then** danh sách sinh viên phù hợp hiện ra.
- **Given** tôi chọn một sinh viên, **When** trang chi tiết mở, **Then** hiển thị danh sách kỳ thi đã tham gia với điểm, trạng thái, thời gian.

---

### US-19: Xem chi tiết bài làm sinh viên
**As an** admin,  
**I want to** xem từng câu trả lời của sinh viên trong một kỳ thi,  
**So that** tôi có thể đánh giá chi tiết kết quả.

**Acceptance Criteria:**
- **Given** tôi chọn một kỳ thi của sinh viên, **When** chi tiết mở, **Then** hiển thị từng câu: câu hỏi, đáp án SV chọn, đáp án đúng, giải thích (nếu có).
- **Given** tôi bấm "Xuất báo cáo", **When** jsPDF xử lý, **Then** báo cáo kết quả sinh viên được tải xuống dạng PDF có thể in.

---

## Story Summary

| Epic | Số Stories |
|---|---|
| Authentication | 4 (US-01 → US-04) |
| Danh sách kỳ thi | 2 (US-05 → US-06) |
| Bài thi | 3 (US-07 → US-09) |
| Kết quả | 2 (US-10 → US-11) |
| Admin Dashboard | 1 (US-12) |
| Admin Quản lý kỳ thi | 3 (US-13 → US-15) |
| Admin Thống kê | 2 (US-16 → US-17) |
| Admin Kết quả SV | 2 (US-18 → US-19) |
| **Tổng** | **19 stories** |
