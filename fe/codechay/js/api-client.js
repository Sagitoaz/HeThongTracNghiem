/**
 * API client for codechay FE (codechay backend on :8081)
 */
const PageLoader = (() => {
  let activeRequests = 0;
  let overlay;
  let textEl;
  let timerId;

  ensureStyle();
  ensureOverlay();
  wirePageTransitions();

  function ensureStyle() {
    if (document.getElementById('page-loader-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'page-loader-style';
    style.textContent =
      '.page-loader-overlay{position:fixed;inset:0;background:rgba(255,255,255,.78);backdrop-filter:blur(1px);display:flex;align-items:center;justify-content:center;z-index:5000;opacity:0;pointer-events:none;transition:opacity .2s ease}' +
      '.page-loader-overlay.is-visible{opacity:1;pointer-events:auto}' +
      '.page-loader-box{display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 20px;border-radius:12px;background:#fff;box-shadow:0 8px 28px rgba(0,0,0,.12)}' +
      '.page-loader-spinner{width:30px;height:30px;border:3px solid rgba(185,28,28,.25);border-top-color:#b91c1c;border-radius:50%;animation:pageLoaderSpin .75s linear infinite}' +
      '.page-loader-text{font-size:14px;color:#333;font-weight:600}' +
      '@keyframes pageLoaderSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  }

  function ensureOverlay() {
    overlay = document.getElementById('pageLoaderOverlay');
    if (overlay) {
      textEl = overlay.querySelector('.page-loader-text');
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'pageLoaderOverlay';
    overlay.className = 'page-loader-overlay';
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML =
      '<div class="page-loader-box">' +
      '<div class="page-loader-spinner" aria-hidden="true"></div>' +
      '<div class="page-loader-text">Đang tải dữ liệu...</div>' +
      '</div>';

    document.addEventListener('DOMContentLoaded', () => {
      if (!document.body.contains(overlay)) {
        document.body.appendChild(overlay);
      }
    });

    if (document.body) {
      document.body.appendChild(overlay);
    }

    textEl = overlay.querySelector('.page-loader-text');
  }

  function show(message) {
    ensureOverlay();
    if (textEl && message) {
      textEl.textContent = message;
    }
    overlay.classList.add('is-visible');
  }

  function hide() {
    if (!overlay) {
      return;
    }
    overlay.classList.remove('is-visible');
  }

  function showDataLoading(message) {
    activeRequests += 1;
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      if (activeRequests > 0) {
        show(message || 'Đang tải dữ liệu...');
      }
    }, 120);
  }

  function hideDataLoading() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      hide();
    }
  }

  function showPageLoading(message) {
    show(message || 'Đang chuyển trang...');
  }

  function wirePageTransitions() {
    window.addEventListener('pageshow', hide);
    window.addEventListener('load', hide);
    window.addEventListener('beforeunload', () => {
      showPageLoading('Đang chuyển trang...');
    });

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
        return;
      }

      const target = anchor.getAttribute('target');
      if (target && target !== '_self') {
        return;
      }

      showPageLoading('Đang chuyển trang...');
    }, true);
  }

  return {
    showDataLoading,
    hideDataLoading,
    showPageLoading,
    hide,
  };
})();

window.PageLoader = window.PageLoader || PageLoader;

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
    window.PageLoader.showDataLoading('Đang tải dữ liệu từ máy chủ...');

    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
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
    } finally {
      window.PageLoader.hideDataLoading();
    }
  }

  return { BASE_URL, getToken, setAuth, clearAuth, request };
})();
