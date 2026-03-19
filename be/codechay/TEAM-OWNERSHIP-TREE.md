# TEAM OWNERSHIP TREE (BAT BUOC)

```text
be/codechay/
  src/main/java/com/httn/codechay/
    common/                     # Dung chung, khong sua tuy tien
    config/                     # Dung chung, khong sua tuy tien
    shared/                     # Dung chung, khong sua tuy tien

    member1/                    # Thanh vien 1 only
      auth/
      examread/

    member2/                    # Thanh vien 2 only
      adminexam/
      question/

    member3/                    # Thanh vien 3 only
      attempt/
      result/

    member4/                    # Thanh vien 4 only
      adminadvanced/
```

## Mapping nhanh API -> package
- Member 1: auth + exam read -> `member1/auth`, `member1/examread`
- Member 2: admin exam/question CRUD -> `member2/adminexam`, `member2/question`
- Member 3: attempt/result flow -> `member3/attempt`, `member3/result`
- Member 4: import/export/statistics + delete question -> `member4/adminadvanced`

## Rule tao file
- Moi API toi thieu tao 3 file:
  - `XxxController.java`
  - `XxxService.java`
  - `XxxRepository.java`
- DTO dat trong package con `dto/` ben trong module owner.
- Khong tao package moi ngoai so do tren neu chua thong nhat nhom.
