/**
 * auth.js - Authentication & route guards via backend API.
 * Depends on: ApiClient
 */
const AuthService = (function () {
  const CURRENT_USER_KEY = 'currentUser';
  const ADMIN_USER_KEY = 'adminUser';

  async function login(username, password) {
    const uname = (username || '').trim();
    const pwd = (password || '').trim();
    if (!uname || !pwd) {
      return { success: false, message: 'Vui long nhap day du thong tin.' };
    }

    try {
      const payload = await ApiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: uname, password: pwd }),
      });
      ApiClient.setAuth(payload, payload.user, 'user');
      return { success: true, user: getCurrentUser() };
    } catch (err) {
      return { success: false, message: err.message || 'Dang nhap that bai.' };
    }
  }

  async function register(username, email, password, confirmPassword) {
    const uname = (username || '').trim();
    const em = (email || '').trim();
    const pwd = (password || '').trim();
    const cpwd = (confirmPassword || '').trim();

    if (!uname || !em || !pwd || !cpwd) {
      return { success: false, message: 'Vui long nhap day du thong tin.' };
    }

    try {
      await ApiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: uname, email: em, password: pwd, confirmPassword: cpwd }),
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Dang ky that bai.' };
    }
  }

  function logout() {
    ApiClient.clearAuth();
    window.location.href = 'login.html';
  }

  function getCurrentUser() {
    try {
      return JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  async function loginAdmin(username, password) {
    const uname = (username || '').trim();
    const pwd = (password || '').trim();
    if (!uname || !pwd) {
      return { success: false, message: 'Vui long nhap day du thong tin.' };
    }

    try {
      const payload = await ApiClient.request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: uname, password: pwd }),
      });
      ApiClient.setAuth(payload, payload.user, 'admin');
      return { success: true, user: getCurrentAdmin() };
    } catch (err) {
      return { success: false, message: err.message || 'Dang nhap admin that bai.' };
    }
  }

  function logoutAdmin() {
    ApiClient.clearAuth();
    window.location.href = '../admin/login.html';
  }

  function getCurrentAdmin() {
    try {
      return JSON.parse(sessionStorage.getItem(ADMIN_USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function isAdminLoggedIn() {
    return getCurrentAdmin() !== null;
  }

  function guardUserPage(basePath) {
    const bp = basePath !== undefined ? basePath : '';
    if (!getCurrentUser() || !ApiClient.getToken()) {
      window.location.href = bp + 'login.html';
    }
  }

  function guardAdminPage() {
    if (!isAdminLoggedIn() || !ApiClient.getToken()) {
      document.body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Segoe UI,Roboto,sans-serif;background:#F5F5F5;color:#333;">' +
        '<div style="background:#fff;border-radius:8px;padding:48px 64px;box-shadow:0 2px 16px rgba(0,0,0,.12);text-align:center;">' +
        '<h1 style="font-size:28px;color:#C0282D;margin:0 0 8px;">403 - Khong co quyen truy cap</h1>' +
        '<p style="color:#666;margin:0 0 24px;">Ban can dang nhap voi tai khoan quan tri de xem trang nay.</p>' +
        '<a href="login.html" style="display:inline-block;padding:12px 32px;background:#C0282D;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Dang nhap Admin</a>' +
        '</div></div>';
      throw new Error('GUARD_REDIRECT');
    }
  }

  return {
    login,
    register,
    logout,
    getCurrentUser,
    loginAdmin,
    logoutAdmin,
    getCurrentAdmin,
    isAdminLoggedIn,
    guardUserPage,
    guardAdminPage,
  };
})();
