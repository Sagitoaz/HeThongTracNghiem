# HUONG DAN MEMBER 2 - TU HOC, TU CODE, TU TEST (SPRING BOOT)

Tai lieu nay viet cho nguoi moi bat dau voi Spring Boot.
Muc tieu: ban tu code duoc 6 API duoc phan cong cho Member 2, vua lam vua hieu.

## 1) Ban se lam gi?

Member 2 phu trach 6 API:
1. `POST /api/v1/admin/exams`
2. `PUT /api/v1/admin/exams/{examId}`
3. `DELETE /api/v1/admin/exams/{examId}`
4. `GET /api/v1/admin/exams/{examId}/questions`
5. `POST /api/v1/admin/exams/{examId}/questions`
6. `PUT /api/v1/admin/exams/{examId}/questions/{questionId}`

Bang DB lien quan:
- `public.exams`
- `public.questions`
- `public.audit_logs`

Owner package cua ban:
- `member2/adminexam`
- `member2/question`

## 2) Tu duy don gian truoc khi code

Moi API se di qua 3 lop:
1. Controller: nhan request HTTP
2. Service: xu ly nghiep vu
3. Repository: chay SQL voi `JdbcTemplate`

Cong thuc nho:
- Route dung
- Validation dung
- SQL dung bang
- Response dung JSON
- Ma loi co y nghia (`400/401/403/404`)

## 3) Chuan bi moi truong (lam 1 lan)

1. Mo terminal tai `be/codechay`.
2. Chay build nhanh:
   - Windows: `mvnw.cmd clean compile`
3. Chac chan file `.env.example` da copy thanh `.env` (neu team dang dung cach nay) hoac da set ENV trong IDE.
4. Chac chan app chay duoc:
   - Windows: `mvnw.cmd spring-boot:run`

Neu app chay thanh cong, dung lai de code tiep.

## 4) Tao skeleton package + class

Trong `src/main/java/com/httn/codechay/member2/`, tao cau truc:

```text
member2/
  adminexam/
    dto/
      ExamUpsertRequest.java
    AdminExamController.java
    AdminExamService.java
    AdminExamRepository.java
  question/
    dto/
      QuestionUpsertRequest.java
    QuestionAdminController.java
    QuestionAdminService.java
    QuestionAdminRepository.java
```

Goi y:
- Ban co the gop repository thanh 1 file neu muon don gian.
- Nhung de hoc tot, cu tach theo module `adminexam` va `question`.

## 5) DTO can tao truoc (de validation)

## 5.1 ExamUpsertRequest

Thuoc tinh:
- `name` (3..255, not blank)
- `description` (max 2000, co the null)
- `type` (`free` hoac `scheduled`)
- `durationMinutes` (1..300)
- `startTime` (`Instant`, bat buoc neu type = scheduled)

Validation goi y:
- `@NotBlank`, `@Size`, `@Min`, `@Max`

## 5.2 QuestionUpsertRequest

Thuoc tinh:
- `text` (1..2000)
- `options` (bat buoc dung 4 phan tu)
- `correctOptionIndex` (0..3)
- `explanation` (optional, max 2000)

Validation goi y:
- `@NotBlank`, `@NotNull`, `@Size(min=4,max=4)`, `@Min(0)`, `@Max(3)`

## 6) Lam module Admin Exam (3 API dau)

## 6.1 Controller cho admin exam

Class: `AdminExamController`

`@RestController`
`@RequestMapping("/api/v1/admin/exams")`

Method:
1. `@PostMapping` -> create exam
2. `@PutMapping("/{examId}")` -> update exam
3. `@DeleteMapping("/{examId}")` -> delete exam

## 6.2 Service cho admin exam

Class: `AdminExamService`

Business rules toi thieu:
1. Neu `type=scheduled` ma `startTime=null` -> nem loi 400.
2. Tao exam xong thi tra object exam vua tao.
3. Update exam xong tra object exam moi.
4. Delete exam dung soft-delete (`deleted_at`, `deleted_by`, `updated_at`).

## 6.3 Repository cho admin exam

Class: `AdminExamRepository`

SQL goi y:
- Insert exam:
  - `insert into public.exams(...) values(...) returning id::text`
- Update exam:
  - `update public.exams set ... where id=cast(? as uuid) and deleted_at is null`
- Delete exam (soft):
  - `update public.exams set deleted_at=now(), deleted_by=cast(? as uuid), updated_at=now() where id=cast(? as uuid)`
- Lay chi tiet exam:
  - `select id::text as id, name, description, type::text as type, duration_minutes as "durationMinutes", start_time as "startTime" ...`

## 7) Lam module Question (3 API sau)

## 7.1 Controller cho question

Class: `QuestionAdminController`

`@RestController`
`@RequestMapping("/api/v1/admin/exams/{examId}/questions")`

Method:
1. `@GetMapping` -> list questions cua exam
2. `@PostMapping` -> create question
3. `@PutMapping("/{questionId}")` -> update question

## 7.2 Service cho question

Class: `QuestionAdminService`

Business rules toi thieu:
1. List question: tra ve mang question.
2. Create question: insert xong tra object vua tao.
3. Update question: update xong tra object da sua.
4. Neu khong tim thay exam/question -> tra 404.

## 7.3 Repository cho question

Class: `QuestionAdminRepository`

SQL goi y:
- List:
  - `select id::text as id, question_text as text, option_a, option_b, option_c, option_d, correct_option_index as "correctOptionIndex", coalesce(explanation,'') as explanation from public.questions where exam_id=cast(? as uuid) and deleted_at is null`
- Create:
  - `insert into public.questions(exam_id, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation) values(cast(? as uuid),?,?,?,?,?,?,?) returning id::text`
- Update:
  - `update public.questions set question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option_index=?, explanation=?, updated_at=now() where exam_id=cast(? as uuid) and id=cast(? as uuid) and deleted_at is null`

## 8) Ghi audit_logs (khuyen nghi nen co)

Neu team da co `AuditService`, moi hanh dong admin nen log:
- CREATE_EXAM
- UPDATE_EXAM
- DELETE_EXAM
- CREATE_QUESTION
- UPDATE_QUESTION

Neu chua co service rieng, ban co the lam don gian:
- tao ham `insert into public.audit_logs(...)`
- goi sau khi thao tac thanh cong

## 9) Test tung API bang Postman (rat chi tiet)

Header chung:
- `Content-Type: application/json`
- `Authorization: Bearer {{access_token_admin}}`

Base URL:
- `{{base_url}} = http://localhost:8080/api/v1`

## 9.1 API 1 - POST /admin/exams

URL:
- `{{base_url}}/admin/exams`

Body:
```json
{
  "name": "Giua ky Mang",
  "description": "De giua ky",
  "type": "scheduled",
  "durationMinutes": 45,
  "startTime": "2026-06-01T08:00:00Z"
}
```

Ky vong:
- `201`
- Response co `id`

Postman Tests:
```javascript
const json = pm.response.json();
pm.test("status 201", () => pm.response.to.have.status(201));
pm.environment.set("exam_id", json.id);
```

Test loi:
- `durationMinutes=0` -> ky vong `400`
- `type=scheduled` nhung khong gui `startTime` -> `400`

## 9.2 API 2 - PUT /admin/exams/{examId}

URL:
- `{{base_url}}/admin/exams/{{exam_id}}`

Body:
```json
{
  "name": "Giua ky Mang - Updated",
  "description": "Cap nhat mo ta",
  "type": "scheduled",
  "durationMinutes": 50,
  "startTime": "2026-06-01T08:30:00Z"
}
```

Ky vong:
- `200`
- `name` da doi thanh gia tri moi

Test loi:
- `exam_id` random khong ton tai -> `404` (hoac 400 neu cast UUID fail)

## 9.3 API 3 - DELETE /admin/exams/{examId}

URL:
- `{{base_url}}/admin/exams/{{exam_id}}`

Ky vong:
- `204`
- Khong co body

Test bo sung:
- Xoa xong, goi lai PUT vao exam da xoa -> ky vong `404` hoac khong tim thay.

## 9.4 API 4 - GET /admin/exams/{examId}/questions

Truoc khi test:
- Tao 1 exam moi de lay `exam_id` hop le.

URL:
- `{{base_url}}/admin/exams/{{exam_id}}/questions`

Ky vong:
- `200`
- Tra ve array (co the rong)

Test script:
```javascript
pm.test("status 200", () => pm.response.to.have.status(200));
const arr = pm.response.json();
pm.test("is array", () => pm.expect(Array.isArray(arr)).to.eql(true));
```

## 9.5 API 5 - POST /admin/exams/{examId}/questions

URL:
- `{{base_url}}/admin/exams/{{exam_id}}/questions`

Body:
```json
{
  "text": "OSI co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Mo hinh OSI gom 7 tang."
}
```

Ky vong:
- `201`
- Response co `id` cua question

Postman Tests:
```javascript
const json = pm.response.json();
pm.test("status 201", () => pm.response.to.have.status(201));
pm.environment.set("question_id", json.id);
```

Test loi:
- `options` khong du 4 phan tu -> `400`
- `correctOptionIndex=5` -> `400`

## 9.6 API 6 - PUT /admin/exams/{examId}/questions/{questionId}

URL:
- `{{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}`

Body:
```json
{
  "text": "OSI co bao nhieu tang? (ban cap nhat)",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Cap nhat explanation."
}
```

Ky vong:
- `200`
- `text` da duoc cap nhat

Test loi:
- `question_id` sai -> `404`

## 10) Luong test de ban theo tung buoc

Lam dung thu tu nay de it loi:
1. Dang nhap admin, luu `access_token_admin`.
2. Test API 1 (tao exam), luu `exam_id`.
3. Test API 5 (tao question), luu `question_id`.
4. Test API 4 (list question) de check du lieu.
5. Test API 6 (update question).
6. Test API 2 (update exam).
7. Test API 3 (delete exam) o cuoi cung.

## 11) Checkpoint tu hoc sau moi ngay

Sau moi ngay, tu check:
1. Minh co hieu route nay map vao method nao trong controller khong?
2. Minh co hieu vi sao can service khong?
3. Minh co hieu SQL nao dang chay khong?
4. Minh da test ca case thanh cong va case loi chua?
5. Minh co the tu giai thich luong request -> response bang loi noi cua minh khong?

Neu tra loi "co" cho 5 cau tren, ban dang tien bo rat tot.

## 12) Lenh nhanh de tu tin hon truoc khi push

Tai `be/codechay`:
1. `mvnw.cmd clean compile`
2. `mvnw.cmd test`
3. `mvnw.cmd spring-boot:run`

Neu compile pass + Postman pass 6 API cua ban, ban dat muc tieu Member 2.

