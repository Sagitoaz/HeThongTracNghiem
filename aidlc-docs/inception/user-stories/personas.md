# Personas — Hệ Thống Trắc Nghiệm Trực Tuyến (PTIT)

---

## Persona 1: Sinh Viên (Student)

| Thuộc tính | Chi tiết |
|---|---|
| **Tên đại diện** | Nguyễn Văn An |
| **Vai trò** | Sinh viên đại học PTIT |
| **Mục tiêu chính** | Luyện tập và tham gia kỳ thi trắc nghiệm trực tuyến |
| **Thiết bị** | Laptop (chính), điện thoại (phụ) |
| **Trình độ kỹ thuật** | Trung bình — quen sử dụng web cơ bản |

### Nhu cầu
- Đăng nhập nhanh để vào thi
- Xem rõ danh sách các kỳ thi còn hạn và đã hết hạn
- Làm bài thi có đồng hồ đếm ngược rõ ràng
- Xem kết quả và biết sai ở đâu sau khi nộp bài

### Điểm đau (Pain Points)
- Lo lắng hết giờ mà chưa nộp kịp
- Không biết mình đã trả lời câu nào và còn bao nhiêu câu chưa làm

### Acceptance Criteria liên quan
- Giao diện đơn giản, không mất thời gian tìm nút
- Timer luôn hiển thị rõ ràng trong suốt quá trình thi
- Sau khi nộp bài, kết quả hiển thị ngay lập tức

---

## Persona 2: Admin / Giáo Viên

| Thuộc tính | Chi tiết |
|---|---|
| **Tên đại diện** | Trần Thị Bình |
| **Vai trò** | Giảng viên / Quản trị viên hệ thống |
| **Mục tiêu chính** | Quản lý đề thi, theo dõi kết quả sinh viên, xuất báo cáo |
| **Thiết bị** | Laptop / Desktop |
| **Trình độ kỹ thuật** | Khá — có thể sử dụng Excel và các công cụ văn phòng |

### Nhu cầu
- Tạo và chỉnh sửa kỳ thi nhanh chóng, kể cả import từ Excel
- Xem thống kê tổng hợp kết quả toàn bộ sinh viên
- Tìm và xem chi tiết kết quả của từng sinh viên cụ thể
- Xuất báo cáo PDF để in/lưu trữ

### Điểm đau (Pain Points)
- Nhập câu hỏi thủ công tốn nhiều thời gian (cần import Excel)
- Khó tổng hợp kết quả nhiều sinh viên cùng lúc

### Acceptance Criteria liên quan
- Form tạo kỳ thi đủ trực quan, có thể thêm/xóa câu hỏi linh hoạt
- Import Excel thành công hiển thị preview câu hỏi trước khi lưu
- Biểu đồ thống kê dễ đọc, có thể lọc theo kỳ thi
