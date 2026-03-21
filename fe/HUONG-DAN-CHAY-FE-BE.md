# Huong dan chay web that (FE + BE)

## 1) Chay backend

### BE tieu chuan (`api-service`)
- Thu muc: `be/api-service`
- Port: `8080`
- Base URL: `http://localhost:8080/api/v1`
- Lenh:

```bash
./mvnw spring-boot:run
```

### BE codechay (`codechay`)
- Thu muc: `be/codechay`
- Port: `8081`
- Base URL: `http://localhost:8081/api/v1`
- Lenh:

```bash
./mvnw spring-boot:run
```

## 2) Chay frontend

- Dung 1 static server (Live Server, Vite preview, nginx, ...)
- CORS da mo cho cac origin dev pho bien:
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

### FE tieu chuan
- Thu muc: `fe/`
- API client: `fe/js/api-client.js`
- Mac dinh goi BE: `http://localhost:8080/api/v1`

### FE codechay
- Thu muc: `fe/codechay/`
- API client: `fe/codechay/js/api-client.js`
- Mac dinh goi BE: `http://localhost:8081/api/v1`

## 3) Luong test nhanh

### FE tieu chuan
1. `fe/register.html` -> dang ky student
2. `fe/login.html` -> dang nhap student
3. `fe/index.html` -> vao de thi
4. `fe/exam.html?id=<examId>` -> lam bai
5. `fe/result.html?id=<resultId>` -> xem ket qua
6. `fe/admin/login.html` -> dang nhap admin, quan ly de thi/thong ke

### FE codechay
1. `fe/codechay/register.html` -> dang ky student
2. `fe/codechay/login.html` -> dang nhap student
3. `fe/codechay/index.html` -> vao de thi
4. `fe/codechay/exam.html?id=<examId>` -> lam bai
5. `fe/codechay/result.html?id=<resultId>` -> xem ket qua
6. `fe/codechay/admin/login.html` -> dang nhap admin

## 4) Luu y
- Mot so man hinh admin cu khong co API backend tuong ung day du (vd: danh sach recent submissions tong hop hoac CRUD user tren dashboard), da duoc de o trang thai thong bao ro rang thay vi fake data.
- Neu can doi endpoint, sua bien `BASE_URL` trong file api-client tuong ung.
