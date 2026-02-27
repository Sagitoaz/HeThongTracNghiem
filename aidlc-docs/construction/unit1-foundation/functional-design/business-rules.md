# Business Rules — Unit 1: Shared Foundation

## BR-DATA: DataService Rules

### BR-DATA-01: Initialization
- DataService.init() MUST be called once at the start of every page (before any other service)
- If `localStorage['httn_initialized']` is `true`, skip seed — do NOT overwrite user data
- If key is absent or `false`, seed all mock data and set `httn_initialized = true`

### BR-DATA-02: ID Generation
- All new entities get ID: `Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)`
- IDs are globally unique across all collections

### BR-DATA-03: Read Safety
- All `get*()` methods must handle `null` / missing key gracefully (return `[]` or `null`)
- Use `JSON.parse(localStorage.getItem(key) || '[]')` pattern

### BR-DATA-04: Write Safety
- All `save*()` methods must serialize with `JSON.stringify` before write
- Upsert logic: if entity with same `id` exists → replace; otherwise → append

---

## BR-AUTH: AuthService Rules

### BR-AUTH-01: Student Login Validation
- Username: must not be empty (trim whitespace)
- Password: must not be empty (trim whitespace)
- Match: find user where `username === input` AND `password === input` AND `role === 'user'`
- On success: write `SessionUser` to `localStorage['currentUser']`
- On failure: return `{ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu' }`

### BR-AUTH-02: Student Registration Validation
- Username: 3–20 characters, no spaces, not already taken
- Email: must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: must not be empty
- Confirm password: must exactly equal password field
- On success: create User entity, save via DataService, redirect to login
- On failure: return field-specific error message

### BR-AUTH-03: Admin Login
- Admin credentials checked against users with `role === 'admin'`
- Write `SessionUser` to `localStorage['adminUser']` on success
- Same failure rule as BR-AUTH-01

### BR-AUTH-04: Route Guard — User Pages
- Call `AuthService.guardUserPage()` at top of every user page script
- If `localStorage['currentUser']` is absent or null → `window.location.href = '../login.html'` (or `login.html`)
- Must run before any page content renders (synchronous check)

### BR-AUTH-05: Route Guard — Admin Pages
- Call `AuthService.guardAdminPage()` at top of every admin page script
- If `localStorage['adminUser']` is absent → replace page body with 403 message
- 403 message: `<h1>403 - Không có quyền truy cập</h1><a href="../admin/login.html">Đăng nhập Admin</a>`

### BR-AUTH-06: Logout
- `logout()`: removes `localStorage['currentUser']`, redirects to `login.html`
- `logoutAdmin()`: removes `localStorage['adminUser']`, redirects to `admin/login.html`

---

## BR-CSS: Styling Rules

### BR-CSS-01: PTIT Color Palette
```css
--ptit-red:      #C0282D;   /* primary brand color */
--ptit-red-dark: #9B1F23;   /* hover states */
--ptit-white:    #FFFFFF;
--ptit-gray-bg:  #F5F5F5;   /* page background */
--ptit-gray-mid: #E0E0E0;   /* borders, dividers */
--ptit-gray-text:#666666;   /* secondary text */
--ptit-text:     #222222;   /* primary text */
--correct-green: #4CAF50;   /* answer correct */
--wrong-red:     #F44336;   /* answer wrong */
```

### BR-CSS-02: Responsive Breakpoints
- Mobile: `max-width: 768px` — single column, stacked layout
- Tablet: `768px–1024px` — 2-column where applicable
- Desktop: `> 1024px` — full layout

### BR-CSS-03: Typography
- Font: `'Segoe UI', Roboto, sans-serif`
- Base size: 16px, line-height: 1.5
- Headings: h1=2rem, h2=1.5rem, h3=1.25rem
