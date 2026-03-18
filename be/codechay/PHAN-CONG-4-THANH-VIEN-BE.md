# PHAN CONG CHI TIET CODE CHAY BE CHO NHOM 4 THANH VIEN

Muc tieu: chia deu 24 API chinh thanh 4 phan, moi nguoi 6 API, de tu code lai backend dua tren code mau `be/api-service` va DB Supabase da co san.

Pham vi API tinh de chia: Auth (3) + Student (7) + Admin (14) = 24 API.
Khong tinh endpoint health (`/actuator/health`) vao chia viec.

## 1) Nguyen tac lam bai (ban hoc tap, code don gian)
- Uu tien dung duoc, ro rang, de hieu; khong can toi uu hardcore.
- Moi API can dat duoc: route dung, input validation co ban, query DB dung bang, response dung format JSON.
- Co the code don gian hon code mau (it lop hon), nhung giu contract endpoint.
- Neu bi tac o cho nao, tham khao nhanh code trong `be/api-service/src/main/java`.

## 2) Bang DB can dung (tham chieu)
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

## 3) Chia viec deu 4 nguoi (6 API moi nguoi)

## Thanh vien 1 - Auth + Exam Read Core (6 API)
Muc tieu: dung endpoint dang nhap/dang ky va doc de thi.

1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/login`
3. `POST /api/v1/auth/admin/login`
4. `GET /api/v1/exams`
5. `GET /api/v1/exams/{examId}`
6. `GET /api/v1/admin/exams`

Bang lien quan:
- `profiles`, `exams`, `questions`

Dau ra bat buoc:
- Dang ky/dang nhap tra token va thong tin user.
- Danh sach exam co filter/page basic.
- Chi tiet exam co danh sach cau hoi.

---

## Thanh vien 2 - Admin Quan Ly Exam + Question CRUD (6 API)
Muc tieu: quan ly de thi va cau hoi (tao/sua/xoa).

1. `POST /api/v1/admin/exams`
2. `PUT /api/v1/admin/exams/{examId}`
3. `DELETE /api/v1/admin/exams/{examId}`
4. `GET /api/v1/admin/exams/{examId}/questions`
5. `POST /api/v1/admin/exams/{examId}/questions`
6. `PUT /api/v1/admin/exams/{examId}/questions/{questionId}`

Bang lien quan:
- `exams`, `questions`, `audit_logs` (neu muon log thay doi)

Dau ra bat buoc:
- CRUD exam chay on dinh.
- CRUD question chay on dinh.
- Validation co ban: duration, options 4 dap an, correctOptionIndex.

---

## Thanh vien 3 - Student Attempt + Result Flow (6 API)
Muc tieu: flow lam bai cua sinh vien tu start den xem ket qua.

1. `POST /api/v1/exams/{examId}/attempts/start`
2. `PUT /api/v1/attempts/{attemptId}/answers`
3. `POST /api/v1/attempts/{attemptId}/submit`
4. `GET /api/v1/results/{resultId}`
5. `GET /api/v1/me/results`
6. `GET /api/v1/admin/students/{studentId}/results`

Bang lien quan:
- `attempts`, `attempt_answers`, `results`, `questions`, `exams`

Dau ra bat buoc:
- Start attempt tao du lieu hop le.
- Save answer cap nhat duoc theo `attemptId + questionId`.
- Submit tinh diem co ban va luu `results`.
- Lay lich su ket qua theo user/student.

---

## Thanh vien 4 - Admin Delete/Import/Export/Statistics (6 API)
Muc tieu: cac API admin nang cao.

1. `DELETE /api/v1/admin/exams/{examId}/questions/{questionId}`
2. `POST /api/v1/admin/exams/{examId}/questions/import`
3. `GET /api/v1/admin/exams/{examId}/results/export`
4. `GET /api/v1/admin/students/{studentId}/results/export`
5. `GET /api/v1/admin/statistics/overview`
6. `GET /api/v1/admin/statistics/exams/{examId}`

Bang lien quan:
- `questions`, `results`, `attempts`, `export_jobs`, `import_jobs`, `import_job_errors`

Dau ra bat buoc:
- Xoa question chay dung va safe.
- Import file xu ly duoc case co loi.
- Export PDF/XLSX muc don gian (co file tra ve la dat).
- 2 API statistics tra tong hop dung.

## 4) Cach ghep code de tranh conflict
- Moi nguoi tao 1 branch rieng:
  - `feature/member1-auth-exam-read`
  - `feature/member2-admin-exam-question`
  - `feature/member3-student-attempt-result`
  - `feature/member4-admin-import-export-stats`
- Chia thu muc code theo module de conflict it:
  - Member 1: `auth`, mot phan read exam
  - Member 2: `admin` exam/question CRUD
  - Member 3: `student` attempt/result
  - Member 4: `admin` import/export/statistics
- Merge theo thu tu de:
  1) Member 1
  2) Member 2
  3) Member 3
  4) Member 4

## 5) Definition of Done cho tung nguoi
Moi thanh vien duoc tinh hoan thanh khi du 6 dieu kien:
1. Du 6 API duoc assign da map route dung.
2. Postman goi duoc status code hop ly (200/201/204).
3. Case loi co ban tra 400/401/403/404 hop ly.
4. Khong hardcode thong tin nhay cam trong code.
5. Co file note nhanh cac query/chuc nang da lam.
6. Chay local qua `mvnw` khong vo app.

## 6) Ke hoach de team lam trong 2-3 buoi
- Buoi 1: setup moi truong + scaffold route + ket noi DB
- Buoi 2: code logic API chinh theo phan cong
- Buoi 3: test Postman, fix loi, ghep code

## 7) Tai lieu nen mo song song khi code
- `be/api-service/postman/HUONG-DAN-TEST-FULL-API.md`
- `be/api-list.md`
- `be/supabase/migrations/*.sql`
- `be/api-service/src/main/java/...` (code mau)

## 8) Ghi chu quan trong
- Day la bai hoc tap: uu tien dung flow va hieu ban chat API.
- Neu mot API kho (import/export), lam ban toi gian truoc, nang cap sau.
- Giu response format on dinh de FE de nhung.
