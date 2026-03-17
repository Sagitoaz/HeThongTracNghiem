# API Service (Spring Boot)

Backend API cho he thong trac nghiem, tich hop schema Supabase da tao trong `be/supabase`.

## Prerequisites
- Java 17+
- Maven 3.9+
- Supabase DB da apply migration/policies/seed

## Environment Variables
- `SUPABASE_DB_URL`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_JWT_ISSUER`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (neu can mo rong admin call)

## Run
```bash
cd be/api-service
mvn spring-boot:run
```

## API Base
- `http://localhost:8080`
- Prefix theo spec: `/api/v1` co the dat qua proxy; hien tai endpoint map truc tiep nhu OpenAPI paths.

## Postman
- Huong dan demo nhanh: `be/api-service/postman/HUONG-DAN-DEMO-POSTMAN-CHI-TIET.md`
- Huong dan test full endpoint: `be/api-service/postman/HUONG-DAN-TEST-FULL-API.md`

## Notes
- Auth endpoint dang su dung Supabase Auth REST (`/auth/v1/signup`, `/auth/v1/token`).
- Endpoint admin yeu cau role `ADMIN` trong `profiles`.
- Error response thong nhat theo schema: `timestamp/status/error/code/message/path`.
