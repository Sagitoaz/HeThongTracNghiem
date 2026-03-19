# Codechay Backend Shared Starter

Thu muc nay la khung code chung cho nhom 4 nguoi.

## Run
```powershell
cd be/codechay
.\mvnw.cmd spring-boot:run
```

## Framework va thu vien da setup chung
- Spring Boot 3.4.2
- Spring Web
- Spring Validation
- Spring Security + OAuth2 Resource Server (JWT)
- Spring JDBC + PostgreSQL
- Spring WebFlux (de goi external API neu can)
- Apache POI (xlsx)
- OpenPDF (pdf)

## File/Config dung chung da tao
- `pom.xml`
- `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`
- `src/main/resources/application.yml`
- `src/main/java/com/httn/codechay/common/*` (exception format chung)
- `src/main/java/com/httn/codechay/config/SecurityConfig.java`
- `src/main/java/com/httn/codechay/shared/ApiPaths.java`
- `.env.example`

## Quy tac de tranh conflict
- Moi nguoi CHI code trong package owner cua minh (xem `TEAM-OWNERSHIP-TREE.md`).
- File dung chung chi sua khi ca nhom dong y:
  - `common/*`
  - `config/*`
  - `shared/*`
  - `application.yml`
- Dat ten class theo quy uoc:
  - `*Controller`, `*Service`, `*Repository`, `*Dto`
