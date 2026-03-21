/**
 * API client for codechay FE (codechay backend on :8081)
 */
const ApiClient = (() => {
  const BASE_URL = window.__API_BASE_URL__ || 'http://localhost:8081/api/v1';
  const TOKEN_KEY = 'ptit_token';
  const USER_KEY = 'ptit_user';

  const getToken = () => localStorage.getItem(TOKEN_KEY) || '';

  const setAuth = (auth, user, role) => {
    if (auth && auth.accessToken) {
      localStorage.setItem(TOKEN_KEY, auth.accessToken);
    }
    if (user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          role: role || user.role || 'student',
        }),
      );
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('ptit_exam_result');
    localStorage.removeItem('ptit_exam_session');
  };

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(BASE_URL + path, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.blob();

    if (!res.ok) {
      const err = new Error(payload?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return payload;
  }

  return { BASE_URL, getToken, setAuth, clearAuth, request };
})();
