# Code Summary — Unit 1: Shared Foundation

## Files Created

| File | Size | Purpose |
|------|------|---------|
| `data/mock-data.js` | ~180 lines | Seed data: 1 admin, 5 students, 2 exams (1 with 10 questions), 5 results |
| `js/data-service.js` | ~110 lines | localStorage CRUD — users, exams, results + init |
| `js/auth.js` | ~165 lines | Login, register, logout, guards for user & admin |
| `css/main.css` | ~420 lines | Complete design system: tokens, layout, navbar, buttons, forms, cards, table, modal, utils |

## Script Loading Order

All pages that use DataService or AuthService must load scripts in this order:

```html
<!-- 1. Seed data (must come first) -->
<script src="data/mock-data.js"></script>
<!-- 2. Storage layer -->
<script src="js/data-service.js"></script>
<!-- 3. Auth layer -->
<script src="js/auth.js"></script>
<!-- 4. Page-specific scripts -->
<script src="js/page-script.js"></script>
```

Admin pages use relative paths (`../data/mock-data.js` etc.).

## Key Patterns

### Initialisation (call once per page)
```js
DataService.init(); // seeds mock data on first load only
```

### User Page Guard
```js
AuthService.guardUserPage(); // redirects to login.html if not logged in
```

### Admin Page Guard
```js
AuthService.guardAdminPage(); // injects 403 HTML if not admin logged in
```

### Generate a unique ID
```js
const id = DataService.generateId(); // "1718000000000-4kx9zm3q2"
```

## Notes
- Passwords stored as plain text (demo only — no production use).
- `DataService.init()` is idempotent: skipped if `httn_initialized === 'true'` in localStorage.
- `AuthService` uses `sessionStorage` (clears on tab close).
- `guardAdminPage()` throws after injecting 403 to stop further page script execution.
