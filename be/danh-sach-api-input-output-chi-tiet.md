# Danh sách API và mô tả Input/Output chi tiết

## Quy ước chung
- Base URL: `/api/v1`
- Header cho API private:
  - `Authorization: Bearer <JWT>`
  - `Content-Type: application/json` (trừ API upload file)
- Phân trang dùng: `page`, `size`, `sort`
- Chuẩn lỗi đề xuất:

```json
{
  "timestamp": "2026-03-13T10:31:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "durationMinutes must be between 1 and 300",
  "path": "/api/v1/admin/exams"
}
```

---

## 1) Nhóm Authentication

## 1.1 POST `/auth/register`
- **Mục đích**: Đăng ký tài khoản sinh viên.
- **Auth**: Không cần.

### Input
- **Body (JSON)**:
  - `username` (string, bắt buộc, 3-50 ký tự)
  - `email` (string, bắt buộc, đúng định dạng email)
  - `password` (string, bắt buộc, 8-72 ký tự)
  - `confirmPassword` (string, bắt buộc, phải trùng `password`)

### Output
- **201 Created**:
  - `id` (string)
  - `username` (string)
  - `email` (string)
  - `role` (string, `STUDENT`)
  - `createdAt` (string, ISO-8601)
- **400 Bad Request**: Dữ liệu không hợp lệ hoặc trùng username/email.

### Ví dụ output 201
```json
{
  "id": "usr_123",
  "username": "sv1001",
  "email": "sv1001@student.ptit.edu.vn",
  "role": "STUDENT",
  "createdAt": "2026-03-13T10:00:00Z"
}
```

## 1.2 POST `/auth/login`
- **Mục đích**: Đăng nhập sinh viên.
- **Auth**: Không cần.

### Input
- **Body (JSON)**:
  - `usernameOrEmail` (string, bắt buộc)
  - `password` (string, bắt buộc)

### Output
- **200 OK**:
  - `accessToken` (string)
  - `tokenType` (string, thường là `Bearer`)
  - `expiresIn` (number, giây)
  - `user.id` (string)
  - `user.username` (string)
  - `user.email` (string)
  - `user.role` (string, `STUDENT`)
- **401 Unauthorized**: Sai thông tin đăng nhập.

### Ví dụ output 200
```json
{
  "accessToken": "jwt-token...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "usr_123",
    "username": "sv1001",
    "email": "sv1001@student.ptit.edu.vn",
    "role": "STUDENT"
  }
}
```

## 1.3 POST `/auth/admin/login`
- **Mục đích**: Đăng nhập quản trị viên.
- **Auth**: Không cần.

### Input
- **Body (JSON)**:
  - `usernameOrEmail` (string, bắt buộc)
  - `password` (string, bắt buộc)

### Output
- **200 OK**: Cấu trúc giống `/auth/login`, `user.role = ADMIN`.
- **401 Unauthorized**: Sai thông tin đăng nhập.

---

## 2) Nhóm Student

## 2.1 GET `/exams`
- **Mục đích**: Lấy danh sách đề thi theo bộ lọc.
- **Auth**: Tùy chính sách (thường cần token).

### Input
- **Query**:
  - `keyword` (string, tùy chọn)
  - `type` (`free|scheduled`, tùy chọn)
  - `status` (`available|locked`, tùy chọn)
  - `page` (number, tùy chọn, mặc định 0)
  - `size` (number, tùy chọn, mặc định 20, tối đa 100)
  - `sort` (string, tùy chọn, ví dụ `createdAt,desc`)

### Output
- **200 OK**:
  - `content[]`:
    - `id`, `name`, `type`, `durationMinutes`, `questionCount`, `startTime`, `isAvailable`
  - `page`, `size`, `totalElements`, `totalPages`

## 2.2 GET `/exams/{examId}`
- **Mục đích**: Lấy chi tiết đề thi.
- **Auth**: Student token.

### Input
- **Path**:
  - `examId` (string, bắt buộc)

### Output
- **200 OK**:
  - `id`, `name`, `description`, `type`, `durationMinutes`, `startTime`
  - `questions[]`:
    - `id`
    - `text`
    - `options[]` (4 lựa chọn)
- **404 Not Found**: Không tồn tại đề thi.

## 2.3 POST `/exams/{examId}/attempts/start`
- **Mục đích**: Bắt đầu lượt làm bài.
- **Auth**: Student token.

### Input
- **Path**:
  - `examId` (string, bắt buộc)
- **Body**: Không có.

### Output
- **201 Created**:
  - `attemptId`, `examId`, `userId`, `startedAt`, `durationMinutes`, `remainingSeconds`
- **409 Conflict**: Vi phạm rule nghiệp vụ (ví dụ đề `scheduled` đã thi).
- **404 Not Found**: Không tồn tại đề thi.

## 2.4 PUT `/attempts/{attemptId}/answers`
- **Mục đích**: Lưu đáp án trong lúc làm bài.
- **Auth**: Student token.

### Input
- **Path**:
  - `attemptId` (string, bắt buộc)
- **Body (JSON)**:
  - `questionId` (string, bắt buộc)
  - `selectedOptionIndex` (number, bắt buộc, 0..3)

### Output
- **200 OK**:
  - `attemptId` (string)
  - `saved` (boolean)
  - `updatedAt` (string, ISO-8601)
- **400 Bad Request**: Sai dữ liệu đầu vào.
- **404 Not Found**: Không tồn tại attempt.

## 2.5 POST `/attempts/{attemptId}/submit`
- **Mục đích**: Nộp bài và chấm điểm.
- **Auth**: Student token.

### Input
- **Path**:
  - `attemptId` (string, bắt buộc)
- **Body (JSON, tùy chọn)**:
  - `autoSubmit` (boolean, mặc định `false`)

### Output
- **200 OK**:
  - `resultId`, `examId`, `userId`
  - `score` (number)
  - `correct` (number)
  - `total` (number)
  - `submittedAt` (ISO-8601)
  - `durationSeconds` (number)
- **409 Conflict**: Attempt đã submit trước đó.
- **404 Not Found**: Attempt không tồn tại.

## 2.6 GET `/results/{resultId}`
- **Mục đích**: Xem chi tiết kết quả và đáp án.
- **Auth**: Student token.

### Input
- **Path**:
  - `resultId` (string, bắt buộc)

### Output
- **200 OK**:
  - `id`, `examId`, `examName`, `score`, `correct`, `total`
  - `answers[]`:
    - `questionId`
    - `selectedOptionIndex`
    - `correctOptionIndex`
    - `isCorrect`
    - `explanation`
- **403 Forbidden**: Không có quyền xem kết quả này.
- **404 Not Found**: Không tồn tại result.

## 2.7 GET `/me/results`
- **Mục đích**: Lấy lịch sử kết quả của user hiện tại.
- **Auth**: Student token.

### Input
- **Query**:
  - `examId` (string, tùy chọn)
  - `page`, `size`, `sort`

### Output
- **200 OK**:
  - `content[]`:
    - `id`, `examId`, `examName`, `userId`, `username`
    - `score`, `correct`, `total`, `submittedAt`, `durationSeconds`
  - `page`, `size`, `totalElements`, `totalPages`

---

## 3) Nhóm Admin - Quản lý đề thi

> Tất cả API admin yêu cầu `Authorization: Bearer <admin_token>`

## 3.1 GET `/admin/exams`
- **Mục đích**: Danh sách đề thi cho admin.

### Input
- **Query**:
  - `keyword`, `type`, `page`, `size`, `sort`

### Output
- **200 OK**: Dạng phân trang exam summary.

## 3.2 POST `/admin/exams`
- **Mục đích**: Tạo đề thi mới.

### Input
- **Body (JSON)**:
  - `name` (string, bắt buộc, 3-255)
  - `description` (string, tùy chọn, <=2000)
  - `type` (`free|scheduled`, bắt buộc)
  - `durationMinutes` (number, bắt buộc, 1-300)
  - `startTime` (ISO-8601, bắt buộc nếu `type=scheduled`)

### Output
- **201 Created**: object exam đã tạo.
- **400 Bad Request**: dữ liệu không hợp lệ.

## 3.3 PUT `/admin/exams/{examId}`
- **Mục đích**: Cập nhật đề thi.

### Input
- **Path**:
  - `examId` (string)
- **Body**: như create exam.

### Output
- **200 OK**: object exam đã cập nhật.
- **400 Bad Request**, **404 Not Found**

## 3.4 DELETE `/admin/exams/{examId}`
- **Mục đích**: Xóa/ẩn đề thi.

### Input
- **Path**:
  - `examId` (string)

### Output
- **204 No Content**
- **404 Not Found**

## 3.5 GET `/admin/exams/{examId}/questions`
- **Mục đích**: Danh sách câu hỏi của đề.

### Input
- **Path**:
  - `examId` (string)

### Output
- **200 OK**:
  - `[]` danh sách question:
    - `id`, `text`, `options[]`, `correctOptionIndex`, `explanation`

## 3.6 POST `/admin/exams/{examId}/questions`
- **Mục đích**: Thêm câu hỏi.

### Input
- **Path**:
  - `examId` (string)
- **Body (JSON)**:
  - `text` (string, 1-2000)
  - `options` (array string, đúng 4 phần tử, không rỗng)
  - `correctOptionIndex` (number, 0..3)
  - `explanation` (string, tùy chọn, <=2000)

### Output
- **201 Created**: object question.
- **400 Bad Request**: dữ liệu không hợp lệ.

## 3.7 PUT `/admin/exams/{examId}/questions/{questionId}`
- **Mục đích**: Sửa câu hỏi.

### Input
- **Path**:
  - `examId`, `questionId`
- **Body**: như create question.

### Output
- **200 OK**: object question đã cập nhật.
- **400 Bad Request**, **404 Not Found**

## 3.8 DELETE `/admin/exams/{examId}/questions/{questionId}`
- **Mục đích**: Xóa câu hỏi.

### Input
- **Path**:
  - `examId`, `questionId`

### Output
- **204 No Content**
- **404 Not Found**

---

## 4) Nhóm Admin - Import/Export

## 4.1 POST `/admin/exams/{examId}/questions/import`
- **Mục đích**: Import câu hỏi từ Excel.

### Input
- **Path**:
  - `examId`
- **Body**:
  - `multipart/form-data`
  - field `file` (binary `.xlsx`, bắt buộc)

### Output
- **200 OK**:
  - `importedCount` (number)
  - `failedCount` (number)
  - `errors[]`:
    - `row` (number)
    - `message` (string)
- **400 Bad Request**: file không hợp lệ.

## 4.2 GET `/admin/exams/{examId}/results/export`
- **Mục đích**: Export kết quả theo đề.

### Input
- **Path**:
  - `examId`
- **Query**:
  - `format` (`pdf|xlsx`, bắt buộc)
  - `fromDate` (date, tùy chọn)
  - `toDate` (date, tùy chọn)

### Output
- **200 OK**:
  - Trả file stream
  - Header dự kiến:
    - `Content-Type: application/pdf` hoặc MIME Excel
    - `Content-Disposition: attachment; filename=...`
- **400 Bad Request**: format không hỗ trợ.

## 4.3 GET `/admin/students/{studentId}/results/export`
- **Mục đích**: Export kết quả của 1 sinh viên.

### Input
- **Path**:
  - `studentId`
- **Query**:
  - `format` (`pdf|xlsx`, bắt buộc)

### Output
- **200 OK**: file stream (PDF/XLSX)
- **400 Bad Request**, **404 Not Found**

---

## 5) Nhóm Admin - Thống kê

## 5.1 GET `/admin/statistics/overview`
- **Mục đích**: Thống kê tổng quan hệ thống.

### Input
- Không có path/query bắt buộc.

### Output
- **200 OK**:
  - `totalStudents` (number)
  - `totalExams` (number)
  - `totalAttempts` (number)
  - `averageScore` (number)

## 5.2 GET `/admin/statistics/exams/{examId}`
- **Mục đích**: Thống kê theo đề thi.

### Input
- **Path**:
  - `examId` (string)

### Output
- **200 OK**:
  - `examId` (string)
  - `attempts` (number)
  - `averageScore` (number)
  - `scoreDistribution` (array number, 5 bucket)
- **404 Not Found**

## 5.3 GET `/admin/students/{studentId}/results`
- **Mục đích**: Lấy danh sách kết quả của sinh viên.

### Input
- **Path**:
  - `studentId`
- **Query**:
  - `examId` (tùy chọn)
  - `page`, `size`, `sort`

### Output
- **200 OK**:
  - Dữ liệu phân trang `ResultSummary[]`
  - Mỗi phần tử gồm:
    - `id`, `examId`, `examName`
    - `userId`, `username`
    - `score`, `correct`, `total`
    - `submittedAt`, `durationSeconds`

---

## 6) Gợi ý biến Postman nên lưu sau khi test
- Sau login student: lưu `access_token_student`, `student_id`
- Sau login admin: lưu `access_token_admin`
- Sau create/list exam: lưu `exam_id`
- Sau start attempt: lưu `attempt_id`
- Sau submit: lưu `result_id`

Tài liệu này chỉ tập trung vào **danh sách API và Input/Output**, để team dùng trực tiếp khi test contract bằng Postman.
