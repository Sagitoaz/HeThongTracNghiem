/**
 * data-service.js — Central localStorage CRUD layer
 * All reads and writes to localStorage go through this service.
 */
const DataService = (function () {
  const KEYS = {
    INITIALIZED: 'httn_initialized',
    USERS: 'httn_users',
    EXAMS: 'httn_exams',
    RESULTS: 'httn_results',
  };

  // ─── Utils ───────────────────────────────────────────────────────────────

  function generateId() {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function getList(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  function setList(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function upsert(key, item) {
    const list = getList(key);
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    setList(key, list);
  }

  function remove(key, id) {
    const list = getList(key).filter((i) => i.id !== id);
    setList(key, list);
  }

  // ─── Initialisation ──────────────────────────────────────────────────────

  /**
   * Call once at the top of every page before other services.
   * Seeds mock data only on first run.
   */
  function init() {
    if (localStorage.getItem(KEYS.INITIALIZED) === 'true') return;
    if (typeof window.MockData === 'undefined') {
      console.warn('DataService.init: MockData not loaded');
      return;
    }
    setList(KEYS.USERS, window.MockData.users);
    setList(KEYS.EXAMS, window.MockData.exams);
    setList(KEYS.RESULTS, window.MockData.results);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  function getUsers() {
    return getList(KEYS.USERS);
  }

  function getUserById(id) {
    return getList(KEYS.USERS).find((u) => u.id === id) || null;
  }

  function getUserByUsername(username) {
    return getList(KEYS.USERS).find((u) => u.username === username) || null;
  }

  function saveUser(user) {
    if (!user.id) user.id = generateId();
    upsert(KEYS.USERS, user);
  }

  function deleteUser(id) {
    remove(KEYS.USERS, id);
  }

  // ─── Exams ───────────────────────────────────────────────────────────────

  function getExams() {
    return getList(KEYS.EXAMS);
  }

  function getExamById(id) {
    return getList(KEYS.EXAMS).find((e) => e.id === id) || null;
  }

  function saveExam(exam) {
    if (!exam.id) exam.id = generateId();
    upsert(KEYS.EXAMS, exam);
  }

  function deleteExam(id) {
    remove(KEYS.EXAMS, id);
  }

  // ─── Results ─────────────────────────────────────────────────────────────

  function getResults() {
    return getList(KEYS.RESULTS);
  }

  function getResultsByUser(userId) {
    return getList(KEYS.RESULTS).filter((r) => r.userId === userId);
  }

  function getResultsByExam(examId) {
    return getList(KEYS.RESULTS).filter((r) => r.examId === examId);
  }

  function saveResult(result) {
    if (!result.id) result.id = generateId();
    upsert(KEYS.RESULTS, result);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    init,
    generateId,
    // Users
    getUsers,
    getUserById,
    getUserByUsername,
    saveUser,
    deleteUser,
    // Exams
    getExams,
    getExamById,
    saveExam,
    deleteExam,
    // Results
    getResults,
    getResultsByUser,
    getResultsByExam,
    saveResult,
  };
})();
