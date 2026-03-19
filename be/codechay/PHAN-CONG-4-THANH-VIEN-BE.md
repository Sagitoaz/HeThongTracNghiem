# PHAN CONG CHI TIET CODE CHAY BE CHO NHOM 4 THANH VIEN

Muc tieu: chia deu 24 API chinh thanh 4 phan, moi nguoi 6 API, de tu code lai backend dua tren code mau `be/api-service` va DB Supabase da co san.

Pham vi API tinh de chia: Auth (3) + Student (7) + Admin (14) = 24 API.
Khong tinh endpoint health (`/actuator/health`) vao chia viec.

## 0) Nen tang chung da setup san (KHONG CAN MOI NGUOI TU TAO LAI)
Da tao san trong `be/codechay`:
- Maven Wrapper: `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`
- Dependency chung: Spring Boot Web, Validation, Security, OAuth2 Resource Server, JDBC, PostgreSQL, POI, OpenPDF
- Config chung: `src/main/resources/application.yml`, `.env.example`
- Core chung: `common/`, `config/`, `shared/`

Moi nguoi code chung tren mot nen tang, khong tu y doi framework/dependency.

## 1) CAY THU MUC BAT BUOC THEO OWNER
Xem chi tiet tai: `be/codechay/TEAM-OWNERSHIP-TREE.md`

Tom tat:
- Thanh vien 1 chi duoc tao file trong:
  - `src/main/java/com/httn/codechay/member1/auth/`
  - `src/main/java/com/httn/codechay/member1/examread/`
- Thanh vien 2 chi duoc tao file trong:
  - `src/main/java/com/httn/codechay/member2/adminexam/`
  - `src/main/java/com/httn/codechay/member2/question/`
- Thanh vien 3 chi duoc tao file trong:
  - `src/main/java/com/httn/codechay/member3/attempt/`
  - `src/main/java/com/httn/codechay/member3/result/`
- Thanh vien 4 chi duoc tao file trong:
  - `src/main/java/com/httn/codechay/member4/adminadvanced/`

Cac thu muc dung chung (`common`, `config`, `shared`) khong sua tuy tien.

## 2) Nguyen tac lam bai (ban hoc tap, code don gian)
- Uu tien dung duoc, ro rang, de hieu; khong can toi uu hardcore.
- Moi API can dat duoc: route dung, input validation co ban, query DB dung bang, response dung format JSON.
- Co the code don gian hon code mau (it lop hon), nhung giu contract endpoint.
- Neu bi tac o cho nao, tham khao nhanh code trong `be/api-service/src/main/java`.

## 3) Bang DB can dung (tham chieu)
- `public.profiles`
- `public.exams`
- `public.questions`
- `public.attempts`
- `public.attempt_answers`
- `public.results`
- `public.import_jobs`
- `public.import_job_errors`
- `public.export_jobs`
- `public.audit_logs`

## 4) Chia viec deu 4 nguoi (6 API moi nguoi)

## Thanh vien 1 - Auth + Exam Read Core (6 API)
Package owner:
- `member1/auth`
- `member1/examread`

API:
1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. `POST /api/v1/auth/admin/login`
4. `GET /api/v1/exams`
5. `GET /api/v1/exams/{examId}`
6. `GET /api/v1/admin/exams`

Bang lien quan:
- `profiles`, `exams`, `questions`

---

## Thanh vien 2 - Admin Quan Ly Exam + Question CRUD (6 API)
Package owner:
- `member2/adminexam`
- `member2/question`

API:
1. `POST /api/v1/admin/exams`
2. `PUT /api/v1/admin/exams/{examId}`
3. `DELETE /api/v1/admin/exams/{examId}`
4. `GET /api/v1/admin/exams/{examId}/questions`
5. `POST /api/v1/admin/exams/{examId}/questions`
6. `PUT /api/v1/admin/exams/{examId}/questions/{questionId}`

Bang lien quan:
- `exams`, `questions`, `audit_logs`

---

## Thanh vien 3 - Student Attempt + Result Flow (6 API)
Package owner:
- `member3/attempt`
- `member3/result`

API:
1. `POST /api/v1/exams/{examId}/attempts/start`
2. `PUT /api/v1/attempts/{attemptId}/answers`
3. `POST /api/v1/attempts/{attemptId}/submit`
4. `GET /api/v1/results/{resultId}`
5. `GET /api/v1/me/results`
6. `GET /api/v1/admin/students/{studentId}/results`

Bang lien quan:
- `attempts`, `attempt_answers`, `results`, `questions`, `exams`

---

## Thanh vien 4 - Admin Delete/Import/Export/Statistics (6 API)
Package owner:
- `member4/adminadvanced`

API:
1. `DELETE /api/v1/admin/exams/{examId}/questions/{questionId}`
2. `POST /api/v1/admin/exams/{examId}/questions/import`
3. `GET /api/v1/admin/exams/{examId}/results/export`
4. `GET /api/v1/admin/students/{studentId}/results/export`
5. `GET /api/v1/admin/statistics/overview`
6. `GET /api/v1/admin/statistics/exams/{examId}`

Bang lien quan:
- `questions`, `results`, `attempts`, `export_jobs`, `import_jobs`, `import_job_errors`

## 5) Quy uoc tao class de merge de dang
Moi API tao toi thieu:
1. `XxxController.java`
2. `XxxService.java`
3. `XxxRepository.java`

Neu can request/response object thi tao them `dto/` ben trong package owner.

## 6) Cach ghep code de tranh conflict
- Moi nguoi tao 1 branch rieng:
  - `feature/member1-auth-exam-read`
  - `feature/member2-admin-exam-question`
  - `feature/member3-student-attempt-result`
  - `feature/member4-admin-import-export-stats`
- Merge theo thu tu:
  1) Member 1
  2) Member 2
  3) Member 3
  4) Member 4

## 7) Definition of Done cho tung nguoi
1. Du 6 API duoc assign da map route dung.
2. Postman goi duoc status code hop ly (200/201/204).
3. Case loi co ban tra 400/401/403/404 hop ly.
4. Khong hardcode thong tin nhay cam trong code.
5. Co file note nhanh cac query/chuc nang da lam.
6. Chay local qua `mvnw` khong vo app.

## 8) Ke hoach de team lam trong 2-3 buoi
- Buoi 1: setup moi truong + scaffold route + ket noi DB
- Buoi 2: code logic API chinh theo phan cong
- Buoi 3: test Postman, fix loi, ghep code

## 9) Tai lieu nen mo song song khi code
- `be/codechay/README.md`
- `be/codechay/TEAM-OWNERSHIP-TREE.md`
- `be/api-service/postman/HUONG-DAN-TEST-FULL-API.md`
- `be/api-list.md`
- `be/supabase/migrations/*.sql`
- `be/api-service/src/main/java/...` (code mau)
