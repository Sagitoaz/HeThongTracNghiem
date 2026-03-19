# HUONG DAN TEST POSTMAN CHO MEMBER4 (ADMIN ADVANCED)

## 1. Muc tieu
Tai lieu nay huong dan test 6 API cua module member4:
1. DELETE /api/v1/admin/exams/{examId}/questions/{questionId}
2. POST /api/v1/admin/exams/{examId}/questions/import
3. GET /api/v1/admin/exams/{examId}/results/export
4. GET /api/v1/admin/students/{studentId}/results/export
5. GET /api/v1/admin/statistics/overview
6. GET /api/v1/admin/statistics/exams/{examId}

## 2. Dieu kien truoc khi test
- Da run backend codechay.
- App mac dinh chay tai port 8081.
- Da co access token cua admin.
- Database Supabase/PostgreSQL da co du lieu co ban.

Lenh chay nhanh:
- cd be/codechay
- .\\mvnw.cmd spring-boot:run

## 3. Tao Postman Environment
Tao 1 environment ten goi y: HTTN-Codechay-Member4

Them cac bien:
- base_url = http://localhost:8081/api/v1
- admin_token = de trong luc dau
- exam_id = de trong luc dau
- question_id = de trong luc dau
- student_id = de trong luc dau

## 4. Lay token admin
Neu nhom ban da xong API auth:
- Request: POST {{base_url}}/auth/admin/login
- Body JSON:
  {
    "usernameOrEmail": "admin",
    "password": "admin12345"
  }

Sau khi login thanh cong, copy accessToken vao bien admin_token.

Header dung chung cho 6 API:
- Authorization: Bearer {{admin_token}}

## 5. Thu tu test de de theo doi
Nen test theo thu tu:
1. API statistics overview
2. API statistics exam
3. API export exam
4. API export student
5. API import question
6. API delete question

Ly do: se de xac minh du lieu truoc va sau import/delete.

## 6. Chi tiet tung API

### API 1 - Delete question
- Method: DELETE
- URL: {{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}
- Header: Authorization Bearer token
- Body: khong can

Expected:
- 204 No Content: xoa thanh cong
- 404 Not Found: exam hoac question khong ton tai
- 401 Unauthorized: thieu token
- 403 Forbidden: token khong phai admin

Kiem tra sau khi xoa:
- Goi API list question cua admin (neu nhom ban da co) de xac nhan question da bien mat.

### API 2 - Import questions
- Method: POST
- URL: {{base_url}}/admin/exams/{{exam_id}}/questions/import
- Header: Authorization Bearer token
- Body: form-data
  - key = file, type = File, value = file xlsx

Format cot trong file xlsx (dong 1 la header):
- cot 0: question_text
- cot 1: option_a
- cot 2: option_b
- cot 3: option_c
- cot 4: option_d
- cot 5: correct_option_index (0..3)
- cot 6: explanation (optional)

Expected response 200:
- importedCount
- failedCount
- errors (danh sach dong loi)

Vi du logic danh gia:
- importedCount > 0: import co ket qua
- failedCount > 0: xem errors de sua file

### API 3 - Export exam results
- Method: GET
- URL xlsx: {{base_url}}/admin/exams/{{exam_id}}/results/export?format=xlsx
- URL pdf:  {{base_url}}/admin/exams/{{exam_id}}/results/export?format=pdf
- Co the truyen them:
  - fromDate=2026-03-01
  - toDate=2026-03-31

Expected:
- 200 OK
- Response la file stream
- Header Content-Disposition co filename

Cach luu file trong Postman:
- Bam Save Response -> Save to a file

### API 4 - Export student results
- Method: GET
- URL xlsx: {{base_url}}/admin/students/{{student_id}}/results/export?format=xlsx
- URL pdf:  {{base_url}}/admin/students/{{student_id}}/results/export?format=pdf

Expected:
- 200 OK va tra ve file
- 404 Neu student_id khong ton tai

### API 5 - Statistics overview
- Method: GET
- URL: {{base_url}}/admin/statistics/overview

Expected 200 JSON co cac field:
- totalStudents
- totalExams
- totalAttempts
- averageScore

### API 6 - Statistics by exam
- Method: GET
- URL: {{base_url}}/admin/statistics/exams/{{exam_id}}

Expected 200 JSON:
- examId
- attempts
- averageScore
- scoreDistribution (mang 5 phan tu)

Mapping scoreDistribution:
- index 0: score < 2
- index 1: 2 <= score < 4
- index 2: 4 <= score < 6
- index 3: 6 <= score < 8
- index 4: score >= 8

## 7. Test case loi nen chay them
- Format sai: format=csv -> expect 400 VALIDATION_ERROR
- Token student goi API admin -> expect 403
- Khong gui token -> expect 401
- exam_id random UUID -> expect 404
- Upload file khong dung xlsx -> expect 400

## 8. Checklist hoan thanh
- [ ] 6/6 API tra ve status code dung
- [ ] Export xlsx mo duoc
- [ ] Export pdf mo duoc
- [ ] Import co importedCount va failedCount dung voi du lieu
- [ ] Delete question tra 204 va du lieu da soft delete
- [ ] 4 thong ke overview hien thi hop ly
