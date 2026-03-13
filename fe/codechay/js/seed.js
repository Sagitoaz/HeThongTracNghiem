// assets/seed.js
function seedIfEmpty() {
  if (!dbGet(DB_KEYS.EXAMS, null)) {
    DB.saveExams([
      {
        id: "E001",
        name: "Thi thử Toán",
        desc: "Đề demo",
        type: "timed",
        durationMin: 30,
        createdAt: "2026-03-01",
        questions: [],
      },
      {
        id: "E002",
        name: "Thi thử JS",
        desc: "Cơ bản JS",
        type: "free",
        durationMin: null,
        createdAt: "2026-03-02",
        questions: [],
      },
    ]);
  }
  if (!dbGet(DB_KEYS.USERS, null)) {
    DB.saveUsers([
      {
        id: "U001",
        name: "Nguyễn Văn A",
        email: "a@ptit.edu.vn",
        role: "student",
      },
      {
        id: "U002",
        name: "Trần Thị B",
        email: "b@ptit.edu.vn",
        role: "student",
      },
      { id: "U003", name: "Admin", email: "admin@ptit.edu.vn", role: "admin" },
    ]);
  }
  if (!dbGet(DB_KEYS.ATTEMPTS, null)) {
    DB.saveAttempts([
      {
        examId: "E001",
        userId: "U001",
        date: "2026-03-02",
        completed: true,
        score: 8.0,
      },
      {
        examId: "E001",
        userId: "U002",
        date: "2026-03-02",
        completed: false,
        score: 0,
      },
      {
        examId: "E002",
        userId: "U001",
        date: "2026-03-03",
        completed: true,
        score: 7.5,
      },
    ]);
  }
}
