# HUONG DAN TEST POSTMAN CHO MEMBER 2 (CHI TIET)

Muc tieu: test day du 6 API duoc phan cong cho Member 2.
Pham vi:
1. `POST /api/v1/admin/exams`
2. `PUT /api/v1/admin/exams/{examId}`
3. `DELETE /api/v1/admin/exams/{examId}`
4. `GET /api/v1/admin/exams/{examId}/questions`
5. `POST /api/v1/admin/exams/{examId}/questions`
6. `PUT /api/v1/admin/exams/{examId}/questions/{questionId}`

---

## A) Chuan bi truoc khi test

1. Chay backend:
   - mo terminal tai `be/codechay`
   - chay: `.\mvnw.cmd spring-boot:run`
2. Mo Postman.
3. Tao 1 Environment moi, dat ten: `HTTN-LOCAL`.
4. Tao cac bien:
   - `base_url` = `http://localhost:8080/api/v1`
   - `access_token_admin` = de trong
   - `exam_id` = de trong
   - `question_id` = de trong
5. Dam bao ban da co token admin.
   - Neu da co san token: gan vao `access_token_admin`.
   - Neu chua co: goi API login admin cua nhom Member 1 de lay token.

---

## B) Header dung chung

Voi 6 API nay, trong Postman them header:
- `Content-Type: application/json`
- `Authorization: Bearer {{access_token_admin}}`

Luu y:
- Neu quen token -> thuong loi `401`.
- Neu token khong phai admin -> co the `403`.

---

## C) Thu tu test khuyen nghi

Lam theo dung thu tu nay de it loi:
1. Tao exam (API 1) -> luu `exam_id`
2. Cap nhat exam (API 2)
3. Lay list question cua exam (API 4)
4. Tao question (API 5) -> luu `question_id`
5. Cap nhat question (API 6)
6. Xoa exam (API 3)

---

## D) Test tung API (copy-paste duoc)

## API 1 - POST /admin/exams

Request:
- Method: `POST`
- URL: `{{base_url}}/admin/exams`
- Body (raw/json):

```json
{
  "name": "Giua ky Mang",
  "description": "De test Member 2",
  "type": "SCHEDULED",
  "durationMinutes": 45,
  "startTime": "2026-06-01T08:00:00Z"
}
```

Ky vong:
- Status: `201`
- Response co `id`

Tests tab:

```javascript
pm.test("status is 201", function () {
  pm.response.to.have.status(201);
});
const json = pm.response.json();
pm.environment.set("exam_id", json.id);
```

Test loi nhanh:
- `durationMinutes = 0` -> ky vong `400`
- `type = "SCHEDULED"` ma `startTime = null` -> ky vong `400`

---

## API 2 - PUT /admin/exams/{examId}

Request:
- Method: `PUT`
- URL: `{{base_url}}/admin/exams/{{exam_id}}`
- Body:

```json
{
  "name": "Giua ky Mang - Updated",
  "description": "Da cap nhat boi Member 2",
  "type": "SCHEDULED",
  "durationMinutes": 60,
  "startTime": "2026-06-01T09:00:00Z"
}
```

Ky vong:
- Status: `200`
- `name` trong response la ban cap nhat

Tests tab:

```javascript
pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});
const json = pm.response.json();
pm.test("name updated", function () {
  pm.expect(json.name).to.eql("Giua ky Mang - Updated");
});
```

Test loi nhanh:
- doi `{{exam_id}}` thanh uuid khong ton tai -> `404` (hoac `400` neu uuid sai format)

---

## API 4 - GET /admin/exams/{examId}/questions

Request:
- Method: `GET`
- URL: `{{base_url}}/admin/exams/{{exam_id}}/questions`

Ky vong:
- Status: `200`
- Response la array

Tests tab:

```javascript
pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});
const arr = pm.response.json();
pm.test("response is array", function () {
  pm.expect(Array.isArray(arr)).to.eql(true);
});
```

---

## API 5 - POST /admin/exams/{examId}/questions

Request:
- Method: `POST`
- URL: `{{base_url}}/admin/exams/{{exam_id}}/questions`
- Body:

```json
{
  "text": "OSI co bao nhieu tang?",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Mo hinh OSI gom 7 tang."
}
```

Ky vong:
- Status: `201`
- Response co `id`

Tests tab:

```javascript
pm.test("status is 201", function () {
  pm.response.to.have.status(201);
});
const json = pm.response.json();
pm.environment.set("question_id", json.id);
```

Test loi nhanh:
- `options` khong du 4 phan tu -> `400`
- `correctOptionIndex = 5` -> `400`

---

## API 6 - PUT /admin/exams/{examId}/questions/{questionId}

Request:
- Method: `PUT`
- URL: `{{base_url}}/admin/exams/{{exam_id}}/questions/{{question_id}}`
- Body:

```json
{
  "text": "OSI co bao nhieu tang? (cap nhat)",
  "options": ["5", "6", "7", "8"],
  "correctOptionIndex": 2,
  "explanation": "Cap nhat explanation by Member 2"
}
```

Ky vong:
- Status: `200`
- `text` da doi

Tests tab:

```javascript
pm.test("status is 200", function () {
  pm.response.to.have.status(200);
});
const json = pm.response.json();
pm.test("text updated", function () {
  pm.expect(json.text).to.include("cap nhat");
});
```

Test loi nhanh:
- doi `{{question_id}}` sang uuid khong ton tai -> `404`

---

## API 3 - DELETE /admin/exams/{examId}

Request:
- Method: `DELETE`
- URL: `{{base_url}}/admin/exams/{{exam_id}}`

Ky vong:
- Status: `204`
- Khong co response body

Test bo sung:
- Goi lai API 2 voi `{{exam_id}}` vua xoa -> ky vong `404`

---

## E) Checklist nop bai cho Member 2

1. Test pass 6/6 API theo thu tu tren.
2. Co screenshot ket qua status:
   - `201` (create exam, create question)
   - `200` (update exam, list question, update question)
   - `204` (delete exam)
3. Co test loi co ban (`400`, `404`).
4. Chay lai app va test 1 vong khong loi.

---

## F) Loi thuong gap va cach xu ly nhanh

1. `401 Unauthorized`
   - Kiem tra header `Authorization` co token khong.
2. `403 Forbidden`
   - Token khong phai role admin.
3. `400 Bad Request`
   - Sai validation (`durationMinutes`, `options`, `correctOptionIndex`, ...).
4. `404 Not Found`
   - `exam_id` hoac `question_id` khong ton tai.
5. `500`
   - Xem log Spring Boot trong terminal de tim SQL/exception.

