# HUONG DAN TEST API POSTMAN - MEMBER4 (ADMIN ADVANCED)

## 1. Pham vi
Tai lieu nay huong dan test 6 API cua member4:

1. DELETE `/api/v1/admin/exams/{examId}/questions/{questionId}`
2. POST `/api/v1/admin/exams/{examId}/questions/import`
3. GET `/api/v1/admin/exams/{examId}/results/export`
4. GET `/api/v1/admin/students/{studentId}/results/export`
5. GET `/api/v1/admin/statistics/overview`
6. GET `/api/v1/admin/statistics/exams/{examId}`

## 2. Dieu kien truoc khi test

- Da chay backend `be/codechay`.
- App mac dinh chay tai `http://localhost:8081` va context path `/api/v1`.
- Da co tai khoan admin de login lay JWT.
- Database da co data toi thieu: exam, student, result.

Lenh chay nhanh:

```powershell
cd be/codechay
.\mvnw.cmd spring-boot:run
```

## 3. Tao Postman Environment

Tao environment: `HTTN-Codechay-Member4`

Bien de nghi:

- `base_url` = `http://localhost:8081/api/v1`
- `admin_token` = rong
- `exam_id` = rong
- `question_id` = rong
- `student_id` = rong

## 4. Lay admin token

### 4.1 Request login admin

- Method: `POST`
- URL: `{{base_url}}/auth/admin/login`
- Body JSON:

```json
{
  "usernameOrEmail": "admin@example.com",
  "password": "admin@123456"
}
```

Luu y: neu du an cua ban dung tai khoan admin khac, thay lai credentials tu seed/moi truong cua nhom.

### 4.2 Postman Tests script (tu dong luu token)

```javascript
pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});

const json = pm.response.json();
pm.environment.set("admin_token", json.accessToken);
```

### 4.3 Header chung cho tat ca API member4

- `Authorization: Bearer {{admin_token}}`

## 5. Chuan bi exam_id, question_id, student_id

Ban can co du lieu UUID hop le truoc khi goi API member4:

- `exam_id`: lay tu API admin exams hoac DB.
- `question_id`: lay tu danh sach question cua exam (de test delete).
- `student_id`: lay tu login student (`user.id`) hoac bang `profiles` role student.

Luu y quan trong:

- Neu UUID sai format (khong phai chuoi UUID hop le), database co the tra loi 500.
- De test `404 NOT_FOUND`, hay dung UUID dung format nhung khong ton tai.

## 6. Thu tu test de nghi

1. Statistics overview
2. Statistics theo exam
3. Export ket qua theo exam
4. Export ket qua theo student
5. Import questions
6. Delete question

Thu tu nay giup doi chieu so lieu truoc/sau khi import hoac xoa.

## 7. Chi tiet test tung API

## 7.1 API #1 - DELETE question

- Method: `DELETE`
- URL: `{{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}`
- Header: `Authorization`
- Body: khong co

Ky vong:

- `204 No Content`: xoa thanh cong (soft delete).
- `404 Not Found`: exam khong ton tai hoac question khong ton tai.
- `401 Unauthorized`: thieu/invalid token.
- `403 Forbidden`: token khong phai admin.

## 7.2 API #2 - IMPORT questions (xlsx)

- Method: `POST`
- URL: `{{base_url}}/admin/exams/{{exam_id}}/questions/import`
- Header: `Authorization`
- Body: `form-data`
  - key `file` (type `File`) -> file `.xlsx`

Template cot file xlsx (dong 1 la header, du lieu bat dau tu dong 2):

- cot 0: `question_text` (bat buoc)
- cot 1: `option_a` (bat buoc)
- cot 2: `option_b` (bat buoc)
- cot 3: `option_c` (bat buoc)
- cot 4: `option_d` (bat buoc)
- cot 5: `correct_option_index` (bat buoc, so nguyen 0..3)
- cot 6: `explanation` (khong bat buoc)

Ky vong `200 OK`, response JSON:

```json
{
  "importedCount": 3,
  "failedCount": 1,
  "errors": [
    {
      "row": 5,
      "message": "correct_option_index must be between 0 and 3"
    }
  ]
}
```

## 7.3 API #3 - EXPORT results theo exam

- Method: `GET`
- URL XLSX:
  `{{base_url}}/admin/exams/{{exam_id}}/results/export?format=xlsx`
- URL PDF:
  `{{base_url}}/admin/exams/{{exam_id}}/results/export?format=pdf`
- Query optional:
  - `fromDate=2026-03-01`
  - `toDate=2026-03-31`

Ky vong:

- `200 OK`
- `Content-Disposition` co `attachment; filename=exam-<examId>-results.<format>`
- `Content-Type`:
  - pdf: `application/pdf`
  - xlsx: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Cach luu file tren Postman: bam `Save Response` -> `Save to a file`.

## 7.4 API #4 - EXPORT results theo student

- Method: `GET`
- URL XLSX:
  `{{base_url}}/admin/students/{{student_id}}/results/export?format=xlsx`
- URL PDF:
  `{{base_url}}/admin/students/{{student_id}}/results/export?format=pdf`

Ky vong:

- `200 OK` va tra ve file download.
- `404 Not Found` neu `student_id` khong ton tai.

## 7.5 API #5 - STATISTICS overview

- Method: `GET`
- URL: `{{base_url}}/admin/statistics/overview`

Ky vong `200 OK`, response JSON gom:

- `totalStudents`
- `totalExams`
- `totalAttempts`
- `averageScore`

Vi du:

```json
{
  "totalStudents": 120,
  "totalExams": 10,
  "totalAttempts": 350,
  "averageScore": 6.74
}
```

## 7.6 API #6 - STATISTICS theo exam

- Method: `GET`
- URL: `{{base_url}}/admin/statistics/exams/{{exam_id}}`

Ky vong `200 OK`, response JSON gom:

- `examId`
- `attempts`
- `averageScore`
- `scoreDistribution` (List 5 phan tu)

Mapping `scoreDistribution`:

- index 0: `score < 2`
- index 1: `2 <= score < 4`
- index 2: `4 <= score < 6`
- index 3: `6 <= score < 8`
- index 4: `score >= 8`

Vi du:

```json
{
  "examId": "d7f1c11a-29b5-4c0d-8ccf-8bbf8d12d321",
  "attempts": 78,
  "averageScore": 6.2,
  "scoreDistribution": [2, 8, 20, 27, 21]
}
```

## 8. Error format chung

Khi co loi, backend tra ve theo format:

```json
{
  "timestamp": "2026-03-20T09:00:00Z",
  "status": 403,
  "error": "Forbidden",
  "code": "FORBIDDEN",
  "message": "Admin role required",
  "path": "/api/v1/admin/statistics/overview"
}
```

## 9. Test case negative nen chay them

1. `format=csv` -> ky vong `400 VALIDATION_ERROR` (`Unsupported format`).
2. Khong gui token -> ky vong `401 UNAUTHORIZED`.
3. Dung token student goi API admin -> ky vong `403 FORBIDDEN`.
4. `exam_id` UUID hop le nhung khong ton tai -> ky vong `404 NOT_FOUND`.
5. Upload file rong -> ky vong `400 VALIDATION_ERROR` (`File is required`).
6. XLSX co dong loi du lieu -> ky vong `200`, tang `failedCount`, co `errors[]`.

## 10. Checklist done

- [ ] 6/6 API member4 tra status code dung.
- [ ] Export xlsx mo duoc bang Excel/LibreOffice.
- [ ] Export pdf mo duoc va doc duoc noi dung.
- [ ] Import tra `importedCount`, `failedCount`, `errors` dung voi du lieu test.
- [ ] Delete question tra `204` va khong con hien trong danh sach active.
- [ ] Overview va exam statistics tra so lieu hop ly.
