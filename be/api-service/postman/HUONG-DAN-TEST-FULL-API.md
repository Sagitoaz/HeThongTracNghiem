# HUONG DAN TEST FULL API - CHI TIET TUNG ENDPOINT

Tai lieu nay la ban chi tiet de test day du toan bo endpoint trong backend.

## 1) Chuan bi

## 1.1 Chay BE
```powershell
cd e:\WINDOW\BTL\HTTN\HeThongTracNghiem\be\api-service
.\mvnw.cmd spring-boot:run
```

Yeu cau log co:
- `Tomcat started on port 8080`
- context path `/api/v1`

## 1.2 Tao environment trong Postman

Tao mot environment ten `HTTN` voi cac bien:
- `base_url` = `http://localhost:8080`
- `access_token_student` = rong
- `access_token_admin` = rong
- `student_id` = rong
- `exam_id` = rong
- `question_id` = rong
- `attempt_id` = rong
- `result_id` = rong

## 1.3 Header chung
- Request JSON: `Content-Type: application/json`
- Endpoint student private: `Authorization: Bearer {{access_token_student}}`
- Endpoint admin private: `Authorization: Bearer {{access_token_admin}}`

## 1.4 Error format chung
```json
{
  "timestamp": "2026-03-17T15:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "code": "FORBIDDEN",
  "message": "....",
  "path": "/api/v1/...."
}
```

---

## 2) Danh sach endpoint can test

- Health: 1 endpoint
- Auth: 3 endpoint
- Student: 7 endpoint
- Admin: 14 endpoint
- Tong cong: 25 endpoint map theo code
- So request can goi khi test full (tach format xlsx/pdf): 27 request

---

## 3) Test theo nhom endpoint

## 3.1 Health (1)

## 3.1.1 GET `/api/v1/actuator/health`
- URL: `{{base_url}}/api/v1/actuator/health`
- Auth: khong
- Ky vong: `200`

---

## 3.2 Auth (3)

## 3.2.1 POST `/api/v1/auth/register`
- URL: `{{base_url}}/api/v1/auth/register`
- Auth: khong
- Body:
```json
{
  "username": "sv_demo_full",
  "email": "sv_demo_full@example.com",
  "password": "12345678",
  "confirmPassword": "12345678"
}
```
- Ky vong: `201`

## 3.2.2 POST `/api/v1/auth/login` (student)
- URL: `{{base_url}}/api/v1/auth/login`
- Auth: khong
- Body:
```json
{
  "usernameOrEmail": "student01@example.com",
  "password": "12345678"
}
```
- Ky vong: `200`, response co `accessToken`, `user.id`
- Sau khi goi: copy `accessToken` vao `access_token_student`, `user.id` vao `student_id`

## 3.2.3 POST `/api/v1/auth/admin/login`
- URL: `{{base_url}}/api/v1/auth/admin/login`
- Auth: khong
- Body:
```json
{
  "usernameOrEmail": "admin@example.com",
  "password": "admin@123456"
}
```
- Ky vong: `200`, response role la `ADMIN`
- Sau khi goi: copy `accessToken` vao `access_token_admin`

---

## 3.3 Student APIs (7)

## 3.3.1 GET `/api/v1/exams`
- URL: `{{base_url}}/api/v1/exams?page=0&size=20&sort=createdAt,desc`
- Auth: student token
- Ky vong: `200`, co `content[]`
- Gan `exam_id` = `content[0].id` (neu co)

## 3.3.2 GET `/api/v1/exams/{examId}`
- URL: `{{base_url}}/api/v1/exams/{{exam_id}}`
- Auth: student token
- Ky vong: `200`, co thong tin de va `questions[]`
- Gan `question_id` = `questions[0].id` (neu co)

## 3.3.3 POST `/api/v1/exams/{examId}/attempts/start`
- URL: `{{base_url}}/api/v1/exams/{{exam_id}}/attempts/start`
- Auth: student token
- Ky vong: `201`, co `attemptId`
- Gan `attempt_id` = `attemptId`

## 3.3.4 PUT `/api/v1/attempts/{attemptId}/answers`
- URL: `{{base_url}}/api/v1/attempts/{{attempt_id}}/answers`
- Auth: student token
- Body:
```json
{
  "questionId": "{{question_id}}",
  "selectedOptionIndex": 2
}
```
- Ky vong: `200`, `saved=true`

## 3.3.5 POST `/api/v1/attempts/{attemptId}/submit`
- URL: `{{base_url}}/api/v1/attempts/{{attempt_id}}/submit`
- Auth: student token
- Body: khong bat buoc
- Ky vong: `200`, co `resultId`
- Gan `result_id` = `resultId`

## 3.3.6 GET `/api/v1/results/{resultId}`
- URL: `{{base_url}}/api/v1/results/{{result_id}}`
- Auth: student token
- Ky vong: `200`, co diem va `answers[]`

## 3.3.7 GET `/api/v1/me/results`
- URL: `{{base_url}}/api/v1/me/results?page=0&size=20&sort=submittedAt,desc`
- Auth: student token
- Ky vong: `200`, co danh sach ket qua cua chinh student dang login

---

## 3.4 Admin APIs (14)

## 3.4.1 GET `/api/v1/admin/exams`
- URL: `{{base_url}}/api/v1/admin/exams?page=0&size=20&sort=createdAt,desc`
- Auth: admin token
- Ky vong: `200`

## 3.4.2 POST `/api/v1/admin/exams`
- URL: `{{base_url}}/api/v1/admin/exams`
- Auth: admin token
- Body:
```json
{
  "name": "Demo API Exam Full",
  "description": "Test full endpoint",
  "type": "free",
  "durationMinutes": 30,
  "startTime": null
}
```
- Ky vong: `200/201`, co `id`
- Gan `exam_id` = `id`

## 3.4.3 PUT `/api/v1/admin/exams/{examId}`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}`
- Auth: admin token
- Body:
```json
{
  "name": "Demo API Exam Full Updated",
  "description": "Updated by admin",
  "type": "free",
  "durationMinutes": 35,
  "startTime": null
}
```
- Ky vong: `200`

## 3.4.4 DELETE `/api/v1/admin/exams/{examId}`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}`
- Auth: admin token
- Ky vong: `204`
- Luu y: test endpoint nay o cuoi cung de tranh mat du lieu cho cac buoc sau.

## 3.4.5 GET `/api/v1/admin/exams/{examId}/questions`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions`
- Auth: admin token
- Ky vong: `200`, co list cau hoi

## 3.4.6 POST `/api/v1/admin/exams/{examId}/questions`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions`
- Auth: admin token
- Body:
```json
{
  "text": "OSI co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "OSI gom 7 tang"
}
```
- Ky vong: `200/201`, co `id`
- Gan `question_id` = `id`

## 3.4.7 PUT `/api/v1/admin/exams/{examId}/questions/{questionId}`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions/{{question_id}}`
- Auth: admin token
- Body:
```json
{
  "text": "OSI model co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Cap nhat noi dung"
}
```
- Ky vong: `200`

## 3.4.8 DELETE `/api/v1/admin/exams/{examId}/questions/{questionId}`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions/{{question_id}}`
- Auth: admin token
- Ky vong: `204`

## 3.4.9 POST `/api/v1/admin/exams/{examId}/questions/import`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions/import`
- Auth: admin token
- Body: `form-data`
  - key: `file`
  - type: `File`
  - value: file `.xlsx`
- Ky vong: `200`, co `importedCount`, `failedCount`, `errors[]`

## 3.4.10 GET `/api/v1/admin/exams/{examId}/results/export?format=xlsx`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/results/export?format=xlsx`
- Auth: admin token
- Ky vong: `200`, download file XLSX

## 3.4.11 GET `/api/v1/admin/exams/{examId}/results/export?format=pdf`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/results/export?format=pdf`
- Auth: admin token
- Ky vong: `200`, download file PDF

## 3.4.12 GET `/api/v1/admin/students/{studentId}/results`
- URL: `{{base_url}}/api/v1/admin/students/{{student_id}}/results?page=0&size=20&sort=submittedAt,desc`
- Auth: admin token
- Ky vong: `200`

## 3.4.13 GET `/api/v1/admin/students/{studentId}/results/export?format=xlsx`
- URL: `{{base_url}}/api/v1/admin/students/{{student_id}}/results/export?format=xlsx`
- Auth: admin token
- Ky vong: `200`, download file XLSX

## 3.4.14 GET `/api/v1/admin/students/{studentId}/results/export?format=pdf`
- URL: `{{base_url}}/api/v1/admin/students/{{student_id}}/results/export?format=pdf`
- Auth: admin token
- Ky vong: `200`, download file PDF

## 3.4.15 GET `/api/v1/admin/statistics/overview`
- URL: `{{base_url}}/api/v1/admin/statistics/overview`
- Auth: admin token
- Ky vong: `200`, co `totalStudents`, `totalExams`, `totalAttempts`, `averageScore`

## 3.4.16 GET `/api/v1/admin/statistics/exams/{examId}`
- URL: `{{base_url}}/api/v1/admin/statistics/exams/{{exam_id}}`
- Auth: admin token
- Ky vong: `200`, co `attempts`, `averageScore`, `scoreDistribution`

---

## 4) Case loi nen test

1. Student goi `/admin/*` -> `403 FORBIDDEN`
2. Export sai format (`format=csv`) -> `400 VALIDATION_ERROR`
3. Submit attempt lan 2 -> `409 BUSINESS_CONFLICT`
4. Login sai mat khau -> `401 UNAUTHORIZED`
5. Thieu field bat buoc -> `400 VALIDATION_ERROR`

---

## 5) Thu tu chay full de de khong bi xung dot du lieu

1. Login student
2. Login admin
3. Admin create exam
4. Admin create question
5. Student list/detail exam
6. Student start/save/submit
7. Student xem result + history
8. Admin list exams/questions
9. Admin stats overview/exam
10. Admin export exam/student
11. Admin import question (neu can)
12. Admin update question/exam
13. Admin delete question/exam (de test delete)
