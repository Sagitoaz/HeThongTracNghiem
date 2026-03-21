/**
 * API client for standard FE (api-service on :8080)
 */
const ApiClient = (function () {
  const BASE_URL = window.__API_BASE_URL__ || 'http://localhost:8080/api/v1';
  const TOKEN_KEY = 'accessToken';
  const USER_KEY = 'currentUser';
  const ADMIN_USER_KEY = 'adminUser';

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setAuth(auth, user, role) {
    if (auth && auth.accessToken) {
      sessionStorage.setItem(TOKEN_KEY, auth.accessToken);
    }
    if (user) {
      const normalized = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: role || user.role || 'user',
      };
      if (normalized.role === 'admin') {
        sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(normalized));
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(normalized));
        sessionStorage.removeItem(ADMIN_USER_KEY);
      }
    }
  }

  function clearAuth() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem('httn_exam_session');
  }

  async function request(path, options) {
    const opts = options || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const token = getToken();
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    const res = await fetch(BASE_URL + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json() : await res.blob();

    if (!res.ok) {
      const msg = payload && payload.message ? payload.message : ('HTTP ' + res.status);
      const err = new Error(msg);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return payload;
  }

  return {
    BASE_URL,
    getToken,
    setAuth,
    clearAuth,
    request,
  };
})();
