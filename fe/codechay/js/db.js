const DB_KEYS = {
  EXAMS: "exams",
  USERS: "users",
  ATTEMPTS: "attempts",
};
function dbGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function dbSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
const DB = {
  listExams() {
    return dbGet(DB_KEYS.EXAMS, []);
  },
  saveExams(exams) {
    dbSet(DB_KEYS.EXAMS, exams);
  },

  listUsers() {
    return dbGet(DB_KEYS.USERS, []);
  },
  saveUsers(users) {
    dbSet(DB_KEYS.USERS, users);
  },

  listAttempts() {
    return dbGet(DB_KEYS.ATTEMPTS, []);
  },
  saveAttempts(attempts) {
    dbSet(DB_KEYS.ATTEMPTS, attempts);
  },
};
