# Business Logic Model — Unit 1: Shared Foundation

## Data Initialization Flow

```
Page loads
  --> DataService.init()
    --> check localStorage['httn_initialized']
    --> if false/absent:
          load window.MockData
          write httn_users, httn_exams, httn_results
          set httn_initialized = true
    --> if true: skip (data already exists)
```

## DataService CRUD Logic

### Read Pattern (all get methods)
```
getItems(key):
  raw = localStorage.getItem(key)
  if raw is null → return []
  return JSON.parse(raw)

getItemById(key, id):
  items = getItems(key)
  return items.find(item => item.id === id) || null
```

### Write Pattern (all save methods)
```
saveItem(key, item):
  items = getItems(key)
  index = items.findIndex(i => i.id === item.id)
  if index >= 0 → items[index] = item   (update)
  else → items.push(item)               (insert)
  localStorage.setItem(key, JSON.stringify(items))

deleteItem(key, id):
  items = getItems(key).filter(i => i.id !== id)
  localStorage.setItem(key, JSON.stringify(items))
```

## AuthService Logic

### Login Flow
```
login(username, password):
  if username.trim() === '' OR password.trim() === ''
    → return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' }
  
  user = DataService.getUserByUsername(username.trim())
  if user == null OR user.password !== password OR user.role !== 'user'
    → return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu' }
  
  sessionUser = { id, username, email, role }
  localStorage.setItem('currentUser', JSON.stringify(sessionUser))
  return { success: true, user: sessionUser }
```

### Register Flow
```
register(username, email, password, confirmPassword):
  errors = []
  if username.trim().length < 3 OR > 20 → errors.push('username')
  if !/valid email regex/.test(email)   → errors.push('email')
  if password.trim() === ''              → errors.push('password')
  if password !== confirmPassword        → errors.push('confirmPassword')
  existing = DataService.getUserByUsername(username)
  if existing                            → errors.push('usernameTaken')
  
  if errors.length > 0 → return { success: false, errors }
  
  newUser = { id: generateId(), username, email, password, role: 'user', createdAt: now }
  DataService.saveUser(newUser)
  return { success: true }
```

### Guard Flow
```
guardUserPage():
  session = localStorage.getItem('currentUser')
  if !session → window.location.href = [resolved login path]
  return JSON.parse(session)

guardAdminPage():
  session = localStorage.getItem('adminUser')
  if !session → inject403HTML(); return null
  return JSON.parse(session)

inject403HTML():
  document.body.innerHTML = `
    <div style="text-align:center; padding:80px; font-family:sans-serif">
      <h1 style="color:#C0282D">403</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <a href="login.html">Đăng nhập Admin</a>
    </div>`
```

## Path Resolution Helper

Admin pages are one level deep (`admin/`), user pages are at root.  
Each page's JS must compute relative paths correctly:

```javascript
// In user pages (root level): login.html, index.html, etc.
const BASE_PATH = '';
const ADMIN_PATH = 'admin/';

// In admin pages (admin/ level): admin/dashboard.html, etc.
const BASE_PATH = '../';
const ADMIN_PATH = '';
```

Use `BASE_PATH` prefix when constructing redirect URLs in `guardUserPage()` / `logout()`.
