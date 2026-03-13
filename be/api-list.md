# Tai lieu danh sach API chi tiet (test bang Postman)

Tai lieu nay duoc viet de team co the test backend bang Postman truoc khi nhung FE vao BE.

## 1) Cau hinh chung cho Postman

## 1.1 Environment variables
Tao 1 Environment trong Postman voi cac bien:

- `base_url`: `http://localhost:8080/api/v1`
- `access_token_student`: de trong luc dau
- `access_token_admin`: de trong luc dau
- `exam_id`: de trong luc dau
- `attempt_id`: de trong luc dau
- `result_id`: de trong luc dau
- `student_id`: de trong luc dau

## 1.2 Header chung
- `Content-Type: application/json` (voi API JSON)
- `Authorization: Bearer {{access_token_student}}` hoac `Bearer {{access_token_admin}}` (voi API private)

## 1.3 Chuan loi (error response)
Tat ca API loi nen theo dang:

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

## 1.4 Quy uoc phan trang
- `page`: mac dinh `0`
- `size`: mac dinh `20`, toi da `100`
- `sort`: vi du `createdAt,desc`

## 2) Thu tu test de xuyen suot bang Postman

1. Dang ky/Dang nhap student -> luu `access_token_student`
2. Dang nhap admin -> luu `access_token_admin`
3. Admin tao exam -> luu `exam_id`
4. Admin tao cau hoi cho exam
5. Student xem danh sach exam, lay chi tiet exam
6. Student start attempt -> luu `attempt_id`
7. Student save answer -> submit -> luu `result_id`
8. Student xem `result_id` va lich su ket qua
9. Admin xem thong ke, export, import

## 3) Nhom API Authentication

## 3.1 POST `/auth/register`

- **Muc dich**: Dang ky tai khoan student.
- **Auth**: Khong can.
- **URL**: `{{base_url}}/auth/register`

### Request body

```json
{
  "username": "sv1001",
  "email": "sv1001@student.ptit.edu.vn",
  "password": "12345678",
  "confirmPassword": "12345678"
}
```

### Validation
- `username`: 3-50 ky tu
- `email`: dung dinh dang email
- `password`: 8-72 ky tu
- `confirmPassword`: phai trung `password`

### Response thanh cong `201`

```json
{
  "id": "usr_123",
  "username": "sv1001",
  "email": "sv1001@student.ptit.edu.vn",
  "role": "STUDENT",
  "createdAt": "2026-03-13T10:00:00Z"
}
```

### Loi thuong gap
- `400`: du lieu khong hop le / username-email da ton tai

## 3.2 POST `/auth/login`

- **Muc dich**: Dang nhap student.
- **Auth**: Khong can.
- **URL**: `{{base_url}}/auth/login`

### Request body

```json
{
  "usernameOrEmail": "sv1001",
  "password": "12345678"
}
```

### Response thanh cong `200`

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

### Test script Postman (goi y)
Dat trong tab `Tests`:

```javascript
const json = pm.response.json();
pm.environment.set("access_token_student", json.accessToken);
pm.environment.set("student_id", json.user.id);
```

### Loi thuong gap
- `401`: sai thong tin dang nhap

## 3.3 POST `/auth/admin/login`

- **Muc dich**: Dang nhap admin.
- **Auth**: Khong can.
- **URL**: `{{base_url}}/auth/admin/login`

### Request body

```json
{
  "usernameOrEmail": "admin",
  "password": "admin12345"
}
```

### Response thanh cong `200`
Giong `/auth/login` nhung role la `ADMIN`.

### Test script Postman (goi y)

```javascript
const json = pm.response.json();
pm.environment.set("access_token_admin", json.accessToken);
```

### Loi thuong gap
- `401`: sai thong tin dang nhap

## 4) Nhom API Student

## 4.1 GET `/exams`

- **Muc dich**: Lay danh sach de thi theo bo loc.
- **Auth**: Student/Admin deu co the xem tuy theo policy.
- **URL**: `{{base_url}}/exams`

### Query params
- `keyword` (optional)
- `type` = `free` | `scheduled` (optional)
- `status` = `available` | `locked` (optional)
- `page` (optional)
- `size` (optional)
- `sort` (optional)

### Vi du URL
`{{base_url}}/exams?keyword=mang&type=free&page=0&size=20&sort=createdAt,desc`

### Response thanh cong `200`

```json
{
  "content": [
    {
      "id": "exam_1",
      "name": "Luyen tap Mang",
      "type": "free",
      "durationMinutes": 30,
      "questionCount": 10,
      "startTime": null,
      "isAvailable": true
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### Test script Postman (goi y)

```javascript
const json = pm.response.json();
if (json.content && json.content.length > 0) {
  pm.environment.set("exam_id", json.content[0].id);
}
```

## 4.2 GET `/exams/{examId}`

- **Muc dich**: Lay chi tiet de thi de hien thi cho student.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/exams/{{exam_id}}`

### Response thanh cong `200`

```json
{
  "id": "exam_1",
  "name": "Luyen tap Mang",
  "description": "On tap",
  "type": "free",
  "durationMinutes": 30,
  "startTime": null,
  "questions": [
    {
      "id": "q1",
      "text": "OSI co bao nhieu tang?",
      "options": ["5", "6", "7", "8"]
    }
  ]
}
```

### Loi thuong gap
- `404`: khong ton tai `examId`

## 4.3 POST `/exams/{examId}/attempts/start`

- **Muc dich**: Bat dau luot lam bai.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/exams/{{exam_id}}/attempts/start`
- **Body**: Khong can.

### Rule nghiep vu
- Exam `free`: cho phep nhieu lan
- Exam `scheduled`: moi user chi duoc 1 lan da submit

### Response thanh cong `201`

```json
{
  "attemptId": "att_1",
  "examId": "exam_1",
  "userId": "usr_123",
  "startedAt": "2026-03-13T10:10:00Z",
  "durationMinutes": 30,
  "remainingSeconds": 1800
}
```

### Test script Postman (goi y)

```javascript
const json = pm.response.json();
pm.environment.set("attempt_id", json.attemptId);
```

### Loi thuong gap
- `409`: vi pham rule scheduled (da thi roi)
- `404`: exam khong ton tai

## 4.4 PUT `/attempts/{attemptId}/answers`

- **Muc dich**: Luu dap an trong qua trinh lam bai.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/attempts/{{attempt_id}}/answers`

### Request body

```json
{
  "questionId": "q1",
  "selectedOptionIndex": 2
}
```

### Validation
- `questionId`: bat buoc
- `selectedOptionIndex`: 0..3

### Response thanh cong `200`

```json
{
  "attemptId": "att_1",
  "saved": true,
  "updatedAt": "2026-03-13T10:15:00Z"
}
```

## 4.5 POST `/attempts/{attemptId}/submit`

- **Muc dich**: Nop bai va cham diem.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/attempts/{{attempt_id}}/submit`

### Request body (optional)

```json
{
  "autoSubmit": false
}
```

### Response thanh cong `200`

```json
{
  "resultId": "res_1",
  "examId": "exam_1",
  "userId": "usr_123",
  "score": 8.5,
  "correct": 17,
  "total": 20,
  "submittedAt": "2026-03-13T10:30:00Z",
  "durationSeconds": 1198
}
```

### Test script Postman (goi y)

```javascript
const json = pm.response.json();
pm.environment.set("result_id", json.resultId);
```

### Loi thuong gap
- `409`: attempt da submit truoc do
- `404`: attempt khong ton tai

## 4.6 GET `/results/{resultId}`

- **Muc dich**: Lay chi tiet ket qua + dap an dung/sai.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/results/{{result_id}}`

### Response thanh cong `200`

```json
{
  "id": "res_1",
  "examId": "exam_1",
  "examName": "Luyen tap Mang",
  "score": 8.5,
  "correct": 17,
  "total": 20,
  "answers": [
    {
      "questionId": "q1",
      "selectedOptionIndex": 2,
      "correctOptionIndex": 2,
      "isCorrect": true,
      "explanation": "..."
    }
  ]
}
```

### Loi thuong gap
- `403`: truy cap result khong thuoc user hien tai
- `404`: result khong ton tai

## 4.7 GET `/me/results`

- **Muc dich**: Lay lich su ket qua cua user hien tai.
- **Auth**: `Bearer {{access_token_student}}`
- **URL**: `{{base_url}}/me/results`

### Query params
- `examId` (optional)
- `page`, `size`, `sort`

### Response thanh cong `200`

```json
{
  "content": [
    {
      "id": "res_1",
      "examId": "exam_1",
      "examName": "Luyen tap Mang",
      "userId": "usr_123",
      "username": "sv1001",
      "score": 8.5,
      "correct": 17,
      "total": 20,
      "submittedAt": "2026-03-13T10:30:00Z",
      "durationSeconds": 1198
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

## 5) Nhom API Admin - Quan ly de thi

Tat ca API admin can:
- Header: `Authorization: Bearer {{access_token_admin}}`

## 5.1 GET `/admin/exams`

- **Muc dich**: Lay danh sach de thi cho admin.
- **URL**: `{{base_url}}/admin/exams`
- **Query**: `keyword`, `type`, `page`, `size`, `sort`

### Response `200`
Giong kieu trang thai phan trang cua `GET /exams`.

## 5.2 POST `/admin/exams`

- **Muc dich**: Tao de thi moi.
- **URL**: `{{base_url}}/admin/exams`

### Request body

```json
{
  "name": "Giua ky Mang",
  "description": "De giua ky",
  "type": "scheduled",
  "durationMinutes": 45,
  "startTime": "2026-06-01T08:00:00Z"
}
```

### Validation
- `name`: 3-255
- `durationMinutes`: 1-300
- `type`: `free|scheduled`
- Neu `type=scheduled` thi `startTime` bat buoc

### Response `201`

```json
{
  "id": "exam_10",
  "name": "Giua ky Mang",
  "description": "De giua ky",
  "type": "scheduled",
  "durationMinutes": 45,
  "startTime": "2026-06-01T08:00:00Z",
  "questions": []
}
```

### Test script Postman (goi y)

```javascript
const json = pm.response.json();
pm.environment.set("exam_id", json.id);
```

## 5.3 PUT `/admin/exams/{examId}`

- **Muc dich**: Cap nhat thong tin de thi.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}`
- **Body**: giong create.
- **Response**: `200` object exam da cap nhat.

## 5.4 DELETE `/admin/exams/{examId}`

- **Muc dich**: Xoa/archived de thi.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}`
- **Response**: `204` khong body.

## 5.5 GET `/admin/exams/{examId}/questions`

- **Muc dich**: Lay danh sach cau hoi cua de.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/questions`

### Response `200`

```json
[
  {
    "id": "q1",
    "text": "OSI?",
    "options": ["5", "6", "7", "8"],
    "correctOptionIndex": 2,
    "explanation": "..."
  }
]
```

## 5.6 POST `/admin/exams/{examId}/questions`

- **Muc dich**: Them 1 cau hoi.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/questions`

### Request body

```json
{
  "text": "OSI co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Mo hinh OSI gom 7 tang."
}
```

### Validation
- `text`: 1-2000
- `options`: mang 4 phan tu, moi phan tu khong rong
- `correctOptionIndex`: 0..3
- `explanation`: optional <= 2000

### Response `201`
Tra ve object question vua tao.

## 5.7 PUT `/admin/exams/{examId}/questions/{questionId}`

- **Muc dich**: Sua 1 cau hoi.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}`
- **Body**: giong create question.
- **Response**: `200`.

## 5.8 DELETE `/admin/exams/{examId}/questions/{questionId}`

- **Muc dich**: Xoa 1 cau hoi.
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}`
- **Response**: `204`.

## 6) Nhom API Admin - Import / Export

## 6.1 POST `/admin/exams/{examId}/questions/import`

- **Muc dich**: Import cau hoi tu file Excel.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/questions/import`
- **Body type**: `form-data`
  - key `file` (type File, dinh dang `.xlsx`)

### Response `200`

```json
{
  "importedCount": 40,
  "failedCount": 2,
  "errors": [
    {
      "row": 18,
      "message": "correctOptionIndex must be 0..3"
    }
  ]
}
```

## 6.2 GET `/admin/exams/{examId}/results/export`

- **Muc dich**: Xuat ket qua theo de.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/exams/{{exam_id}}/results/export`

### Query params
- `format`: `pdf|xlsx` (bat buoc)
- `fromDate`: `yyyy-mm-dd` (optional)
- `toDate`: `yyyy-mm-dd` (optional)

### Response `200`
- Tra stream file
- Header can co:
  - `Content-Type`: `application/pdf` hoac excel mime type
  - `Content-Disposition: attachment; filename=...`

## 6.3 GET `/admin/students/{studentId}/results/export`

- **Muc dich**: Xuat ket qua cua 1 sinh vien.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/students/{{student_id}}/results/export?format=pdf`

### Query params
- `format`: `pdf|xlsx` (bat buoc)

### Response `200`
- Tra stream file nhu API export tren.

## 7) Nhom API Admin - Thong ke

## 7.1 GET `/admin/statistics/overview`

- **Muc dich**: Thong ke tong quan he thong.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/statistics/overview`

### Response `200`

```json
{
  "totalStudents": 120,
  "totalExams": 8,
  "totalAttempts": 950,
  "averageScore": 6.8
}
```

## 7.2 GET `/admin/statistics/exams/{examId}`

- **Muc dich**: Thong ke theo tung de thi.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/statistics/exams/{{exam_id}}`

### Response `200`

```json
{
  "examId": "exam_1",
  "attempts": 100,
  "averageScore": 7.1,
  "scoreDistribution": [5, 12, 20, 34, 29]
}
```

## 7.3 GET `/admin/students/{studentId}/results`

- **Muc dich**: Lay danh sach ket qua cua 1 sinh vien.
- **Auth**: Admin
- **URL**: `{{base_url}}/admin/students/{{student_id}}/results`

### Query params
- `examId` (optional)
- `page`, `size`, `sort`

### Response `200`
Dang phan trang `ResultSummary`.

## 8) Bo testcase loi co ban nen test bang Postman

1. Khong gui token vao API private -> ky vong `401`
2. Dung token student goi API admin -> ky vong `403`
3. Submit attempt khong ton tai -> ky vong `404`
4. Tao exam `durationMinutes = 0` -> ky vong `400`
5. Tao question `correctOptionIndex = 5` -> ky vong `400`
6. Import excel sai format -> ky vong `200` voi `failedCount > 0` hoac `400` tuy chinh sach
7. Goi export `format=csv` -> ky vong `400`

## 9) Ghi chu cho team FE truoc khi nhung

- FE co the mock request/response dua tren tai lieu nay de dung contract.
- Khi backend san sang, FE chi can doi datasource tu localStorage sang HTTP API.
- Neu contract thay doi, cap nhat dong thoi:
  - `be/api-list.md`
  - `be/openapi.yaml`
  - bo test Postman collection.
