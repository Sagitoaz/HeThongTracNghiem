# Unit of Work — Dependency Matrix

## Dependency Table

| Unit | UNIT-01 Foundation | UNIT-02 Auth | UNIT-03 User Flow | UNIT-04 Admin Core | UNIT-05 Admin Reports |
|---|:---:|:---:|:---:|:---:|:---:|
| **UNIT-01 Foundation** | — | | | | |
| **UNIT-02 Auth** | ✅ required | — | | | |
| **UNIT-03 User Flow** | ✅ required | ✅ required | — | | |
| **UNIT-04 Admin Core** | ✅ required | ✅ required | | — | |
| **UNIT-05 Admin Reports** | ✅ required | ✅ required | | ✅ required | — |

## Build Order

```
UNIT-01 (Foundation)
    |
    v
UNIT-02 (Auth)
    |
    +------------------+
    |                  |
    v                  v
UNIT-03               UNIT-04
(User Flow)           (Admin Core)
                           |
                           v
                      UNIT-05
                   (Admin Reports)
```

**Critical Path**: UNIT-01 → UNIT-02 → UNIT-04 → UNIT-05  
**Parallel opportunity**: UNIT-03 và UNIT-04 có thể phát triển song song sau UNIT-02

## External CDN Dependencies

| CDN Library | Required By |
|---|---|
| Chart.js | UNIT-03, UNIT-04, UNIT-05 |
| SheetJS (xlsx.js) | UNIT-04 |
| jsPDF | UNIT-05 |

## Shared File Dependencies

| Shared File | Used By Units |
|---|---|
| `data/mock-data.js` | UNIT-01 (creates), All others (reads via DataService) |
| `js/data-service.js` | UNIT-01 (creates), UNIT-02, 03, 04, 05 |
| `js/auth.js` | UNIT-01 (creates), UNIT-02 (extends), 03, 04, 05 |
| `js/export-service.js` | UNIT-05 (creates), also used in UNIT-05 only |
| `css/main.css` | UNIT-01 (creates), all HTML pages |
| `css/admin.css` | UNIT-04 (creates), UNIT-05 pages |
