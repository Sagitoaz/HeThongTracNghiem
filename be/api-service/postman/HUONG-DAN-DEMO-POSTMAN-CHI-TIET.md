# HUONG DAN DEMO POSTMAN CHI TIET (BAN CAP NHAT)

Tai lieu full endpoint: `be/api-service/postman/HUONG-DAN-TEST-FULL-API.md`.

Tai lieu nay dung de demo API backend voi giang vien theo flow ngan gon, ro rang, de chay.

## 1) Chuan bi truoc khi demo

## 1.1 Chuan bi database Supabase
- Da chay migration + seed trong thu muc `be/supabase`.
- Dang dung Supabase cloud (web), khong phai local.
- Neu mang IPv4, uu tien Session Pooler cho JDBC.

## 1.2 Cau hinh `.env` cho API service
File: `be/api-service/.env`

Gia tri toi thieu can dung:
```env
SUPABASE_DB_URL=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres.ryoudimfszahhonnwbkb
SUPABASE_DB_PASSWORD=<DB_PASSWORD>
SUPABASE_JWT_ISSUER=https://ryoudimfszahhonnwbkb.supabase.co/auth/v1
SUPABASE_URL=https://ryoudimfszahhonnwbkb.supabase.co
SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Luu y:
- Khong them dau `;` cuoi dong.
- `/postgres` trong DB URL la dung, khong bo.
- `SUPABASE_DB_USER` voi pooler phai dung dang `postgres.<project-ref>`.

## 1.3 Chay backend
Trong `be/api-service`:
```powershell
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Khi thay log:
- `Tomcat started on port 8080`
- context path `/api/v1`

la backend da san sang.

## 1.4 Thiet lap Postman
Tao mot environment ten `HTTN` (hoac ten ban dat) va dam bao:
- `base_url = http://localhost:8080`

---

## 2) Cac bien moi truong trong Postman

Can co cac bien sau:
- `base_url`
- `access_token_student`
- `access_token_admin`
- `exam_id`
- `attempt_id`
- `result_id`
- `student_id`

Gia tri khoi tao:
- `base_url = http://localhost:8080`
- Cac bien con lai de trong.

---

## 3) Flow demo de xuyen suot (goi y 5-7 phut)

1. Dang nhap student -> lay `access_token_student`
2. Dang nhap admin -> lay `access_token_admin`
3. Admin tao de thi
4. Admin them cau hoi cho de
5. Student xem de, start attempt, nop bai
6. Student xem ket qua
7. Admin xem thong ke tong quan + theo de
8. Admin export ket qua

---

## 4) Huong dan tung request (copy dung thu tu)

## 4.1 POST `/api/v1/auth/login` (student)
- URL: `{{base_url}}/api/v1/auth/login`
- Body:
```json
{
  "usernameOrEmail": "student01@example.com",
  "password": "12345678"
}
```
- Ky vong: `200 OK`, co `accessToken`, `user.id`.
- Tests script:
```javascript
const json = pm.response.json();
pm.environment.set("access_token_student", json.accessToken);
pm.environment.set("student_id", json.user.id);
```

## 4.2 POST `/api/v1/auth/admin/login` (admin)
- URL: `{{base_url}}/api/v1/auth/admin/login`
- Body:
```json
{
  "usernameOrEmail": "admin@example.com",
  "password": "12345678"
}
```
- Ky vong: `200 OK`.
- Tests script:
```javascript
const json = pm.response.json();
pm.environment.set("access_token_admin", json.accessToken);
```

## 4.3 POST `/api/v1/admin/exams` (admin tao de)
- Header: `Authorization: Bearer {{access_token_admin}}`
- URL: `{{base_url}}/api/v1/admin/exams`
- Body:
```json
{
  "name": "Demo API Exam",
  "description": "De demo voi thay",
  "type": "free",
  "durationMinutes": 30,
  "startTime": null
}
```
- Ky vong: `201 Created` (hoac `200` tuy implementation), co `id`.
- Tests script:
```javascript
const json = pm.response.json();
pm.environment.set("exam_id", json.id);
```

## 4.4 POST `/api/v1/admin/exams/{examId}/questions` (admin them cau hoi)
- Header: `Authorization: Bearer {{access_token_admin}}`
- URL: `{{base_url}}/api/v1/admin/exams/{{exam_id}}/questions`
- Body:
```json
{
  "text": "OSI co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "OSI gom 7 tang"
}
```
- Ky vong: `201`/`200`.

## 4.5 GET `/api/v1/exams` (student xem danh sach de)
- Header: `Authorization: Bearer {{access_token_student}}`
- URL: `{{base_url}}/api/v1/exams?page=0&size=20&sort=createdAt,desc`
- Ky vong: `200`, co `content`.

## 4.6 POST `/api/v1/exams/{examId}/attempts/start`
- Header: `Authorization: Bearer {{access_token_student}}`
- URL: `{{base_url}}/api/v1/exams/{{exam_id}}/attempts/start`
- Ky vong: `201`, co `attemptId`.
- Tests script:
```javascript
const json = pm.response.json();
pm.environment.set("attempt_id", json.attemptId);
```

## 4.7 PUT `/api/v1/attempts/{attemptId}/answers`
- Header: `Authorization: Bearer {{access_token_student}}`
- URL: `{{base_url}}/api/v1/attempts/{{attempt_id}}/answers`
- Body:
```json
{
  "questionId": "<question_id>",
  "selectedOptionIndex": 2
}
```

Meo lay `questionId`:
- Goi `GET {{base_url}}/api/v1/exams/{{exam_id}}` (student token),
- Lay `questions[0].id`.

## 4.8 POST `/api/v1/attempts/{attemptId}/submit`
- Header: `Authorization: Bearer {{access_token_student}}`
- URL: `{{base_url}}/api/v1/attempts/{{attempt_id}}/submit`
- Body:
```json
{ "autoSubmit": false }
```
- Ky vong: `200`, co `resultId`.
- Tests script:
```javascript
const json = pm.response.json();
pm.environment.set("result_id", json.resultId);
```

## 4.9 GET `/api/v1/results/{resultId}`
- Header: `Authorization: Bearer {{access_token_student}}`
- URL: `{{base_url}}/api/v1/results/{{result_id}}`
- Ky vong: `200`, co diem, tong cau, danh sach dap an.

## 4.10 GET `/api/v1/admin/statistics/overview`
- Header: `Authorization: Bearer {{access_token_admin}}`
- URL: `{{base_url}}/api/v1/admin/statistics/overview`
- Ky vong: `200`, co `totalStudents`, `totalExams`, `totalAttempts`, `averageScore`.

## 4.11 GET `/api/v1/admin/statistics/exams/{examId}`
- Header: `Authorization: Bearer {{access_token_admin}}`
- URL: `{{base_url}}/api/v1/admin/statistics/exams/{{exam_id}}`
- Ky vong: `200`, co `attempts`, `averageScore`, `scoreDistribution`.

## 4.12 GET export ket qua (admin)
- Theo de:
  - `{{base_url}}/api/v1/admin/exams/{{exam_id}}/results/export?format=xlsx`
  - `{{base_url}}/api/v1/admin/exams/{{exam_id}}/results/export?format=pdf`
- Theo sinh vien:
  - `{{base_url}}/api/v1/admin/students/{{student_id}}/results/export?format=xlsx`
- Header: `Authorization: Bearer {{access_token_admin}}`
- Ky vong: `200`, response la file.

---

## 5) Cac loi hay gap va cach xu ly nhanh

1. `401 Unauthorized`
- Chua login hoac token rong/het han.
- Login lai, kiem tra bien `access_token_*`.

2. `403 Forbidden` o `/admin/*`
- Dang dung token student.
- Hoac user admin trong `profiles` khong co role `admin`.

3. `500 Failed to obtain JDBC Connection`
- Sai `SUPABASE_DB_USER` (pooler can `postgres.<project-ref>`).
- Sai DB password.
- Dang dung Direct trong mang IPv4.
- `.env` co ky tu sai (vd them `;` cuoi dong).

4. `400 Bad Request` khi login
- Sai email/password Auth user trong Supabase Auth.
- Body JSON sai key (`usernameOrEmail`, `password`).

---

## 6) Script thuyet trinh ngan (mau)

1. Mo terminal cho thay thay app dang chay (`Tomcat started on port 8080`).
2. Login student + login admin.
3. Admin tao de + them 1 cau hoi.
4. Student start attempt -> submit.
5. Mo result detail de chung minh cham diem.
6. Admin mo thong ke overview/exam.
7. Export 1 file XLSX/PDF.
