# Functional Design — Unit 2: Authentication

## Domain Entities

All entities defined in Unit 1 (User, SessionUser) are reused. No new entities.

### Relevant localStorage Keys
| Key | Scope |
|-----|-------|
| `currentUser` | sessionStorage — logged-in student |
| `adminUser` | sessionStorage — logged-in admin |

### SessionUser (in-memory + sessionStorage)
```
{ id, username, email, role }
```

---

## Business Rules

### BR-LOGIN-01 — Validation
- Username: không được rỗng sau trim
- Password: không được rỗng sau trim
- Nếu thiếu → hiển thị inline error, không gửi request

### BR-LOGIN-02 — Student Login
- Gọi `AuthService.login(username, password)`
- Success → redirect `index.html`
- Fail → hiển thị error message từ AuthService response

### BR-LOGIN-03 — Admin Login
- Gọi `AuthService.loginAdmin(username, password)`
- Success → redirect `dashboard.html`
- Fail → hiển thị error message

### BR-REGISTER-01 — Form Validation
- Username: 3–20 ký tự, không rỗng
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password: ≥6 ký tự
- Confirm Password: phải khớp với Password
- Mỗi field validate real-time khi blur

### BR-REGISTER-02 — Submit
- Gọi `AuthService.register(username, email, password, confirmPassword)`
- Success → redirect `login.html?registered=1`
- Fail → hiển thị error message

### BR-REDIRECT-01 — Already Logged In
- `login.html`: nếu `AuthService.getCurrentUser()` != null → redirect `index.html`
- `admin/login.html`: nếu `AuthService.isAdminLoggedIn()` → redirect `dashboard.html`

---

## Business Logic Model (Pseudocode)

### login.html
```
onLoad:
  DataService.init()
  if AuthService.getCurrentUser() → window.location = 'index.html'

onSubmit(form):
  username = input[username].value.trim()
  password = input[password].value.trim()
  if empty(username) or empty(password):
    showError('Vui lòng nhập đầy đủ thông tin.')
    return
  result = AuthService.login(username, password)
  if result.success:
    window.location = 'index.html'
  else:
    showError(result.message)
```

### register.html
```
onLoad:
  DataService.init()
  if AuthService.getCurrentUser() → window.location = 'index.html'

onBlur(field):
  validateField(field)  // show/clear per-field error

onSubmit(form):
  validate all fields
  if any error → return
  result = AuthService.register(username, email, password, confirmPassword)
  if result.success:
    window.location = 'login.html?registered=1'
  else:
    showError(result.message)
```

### admin/login.html
```
onLoad:
  DataService.init()
  if AuthService.isAdminLoggedIn() → window.location = 'dashboard.html'

onSubmit(form):
  result = AuthService.loginAdmin(username, password)
  if result.success:
    window.location = 'dashboard.html'
  else:
    showError(result.message)
```
