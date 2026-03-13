/**
 * auth.js — Authentication & route-guard service
 * Depends on: DataService
 */
const AuthService = (function () {
  const CURRENT_USER_KEY = 'currentUser';
  const ADMIN_USER_KEY = 'adminUser';

  // ─── User Auth ───────────────────────────────────────────────────────────

  /**
   * Attempt student/user login.
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, user?: object, message?: string }}
   */
  function login(username, password) {
    const uname = username.trim();
    const pwd = password.trim();
    if (!uname || !pwd) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }
    const user = DataService.getUserByUsername(uname);
    if (!user || user.role !== 'user') {
      return { success: false, message: 'Tài khoản không tồn tại.' };
    }
    if (user.password !== pwd) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }
    const session = { id: user.id, username: user.username, email: user.email, role: 'user' };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  /**
   * Register a new student account.
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {{ success: boolean, message?: string }}
   */
  function register(username, email, password, confirmPassword) {
    const uname = username.trim();
    const em = email.trim();
    const pwd = password.trim();
    const cpwd = confirmPassword.trim();

    if (!uname || !em || !pwd || !cpwd) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }
    if (uname.length < 3 || uname.length > 20) {
      return { success: false, message: 'Tên đăng nhập phải từ 3–20 ký tự.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }
    if (pwd.length < 6) {
      return { success: false, message: 'Mật khẩu phải ít nhất 6 ký tự.' };
    }
    if (pwd !== cpwd) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp.' };
    }
    if (DataService.getUserByUsername(uname)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
    }
    const newUser = {
      id: DataService.generateId(),
      username: uname,
      email: em,
      password: pwd,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    DataService.saveUser(newUser);
    return { success: true };
  }

  /**
   * Log out the current student user.
   */
  function logout() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
  }

  /**
   * Return the current logged-in user object, or null.
   * @returns {object|null}
   */
  function getCurrentUser() {
    try {
      return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  // ─── Admin Auth ──────────────────────────────────────────────────────────

  /**
   * Attempt admin login.
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, user?: object, message?: string }}
   */
  function loginAdmin(username, password) {
    const uname = username.trim();
    const pwd = password.trim();
    if (!uname || !pwd) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }
    const user = DataService.getUserByUsername(uname);
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Tài khoản quản trị không tồn tại.' };
    }
    if (user.password !== pwd) {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }
    const session = { id: user.id, username: user.username, email: user.email, role: 'admin' };
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  /**
   * Log out the admin.
   */
  function logoutAdmin() {
    sessionStorage.removeItem(ADMIN_USER_KEY);
    window.location.href = '../admin/login.html';
  }

  /**
   * Return the logged-in admin object, or null.
   * @returns {object|null}
   */
  function getCurrentAdmin() {
    try {
      return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  /**
   * @returns {boolean}
   */
  function isAdminLoggedIn() {
    return getCurrentAdmin() !== null;
  }

  // ─── Route Guards ─────────────────────────────────────────────────────────

  /**
   * Guard for user pages (root level).
   * Redirects to login.html if not authenticated.
   * @param {string} [basePath=''] - '' for root pages, '../' for admin pages
   */
  function guardUserPage(basePath) {
    const bp = basePath !== undefined ? basePath : '';
    if (!getCurrentUser()) {
      window.location.href = bp + 'login.html';
    }
  }

  /**
   * Guard for admin pages (admin/ level).
   * Injects a 403 Forbidden message into <body> if not admin-authenticated.
   */
  function guardAdminPage() {
    if (!isAdminLoggedIn()) {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    height:100vh;font-family:'Segoe UI',Roboto,sans-serif;background:#F5F5F5;color:#333;">
          <div style="background:#fff;border-radius:8px;padding:48px 64px;box-shadow:0 2px 16px rgba(0,0,0,.12);text-align:center;">
            <div style="font-size:64px;margin-bottom:16px;">🔒</div>
            <h1 style="font-size:28px;color:#C0282D;margin:0 0 8px;">403 — Không có quyền truy cập</h1>
            <p style="color:#666;margin:0 0 24px;">Bạn cần đăng nhập với tài khoản quản trị để xem trang này.</p>
            <a href="login.html"
               style="display:inline-block;padding:12px 32px;background:#C0282D;color:#fff;
                      border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
              Đăng nhập Admin
            </a>
          </div>
        </div>`;
      throw new Error('GUARD_REDIRECT — admin not authenticated');
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    // User
    login,
    register,
    logout,
    getCurrentUser,
    // Admin
    loginAdmin,
    logoutAdmin,
    getCurrentAdmin,
    isAdminLoggedIn,
    // Guards
    guardUserPage,
    guardAdminPage,
  };
})();
