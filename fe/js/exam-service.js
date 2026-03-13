/**
 * exam-service.js — Exam session management and scoring
 * Depends on: DataService
 */
const ExamService = (function () {
  var SESSION_KEY = 'httn_exam_session';

  // ─── Availability ─────────────────────────────────────────

  function getAvailableExams() {
    return DataService.getExams();
  }

  function isExamAvailable(exam) {
    if (exam.type === 'free') return true;
    if (exam.type === 'scheduled') {
      if (!exam.startTime) return false;
      return new Date(exam.startTime).getTime() <= Date.now();
    }
    return false;
  }

  // ─── Session ──────────────────────────────────────────────

  function getExamSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  /**
   * Start or resume an exam session.
   * @param {string} examId
   * @param {string} userId
   * @returns {object|null} ExamSession or null if exam not found
   */
  function startExam(examId, userId) {
    var exam = DataService.getExamById(examId);
    if (!exam) return null;

    // Resume if session already exists for this exam+user
    var existing = getExamSession();
    if (existing && existing.examId === examId && existing.userId === userId) {
      return existing;
    }

    var session = {
      id: DataService.generateId(),
      examId: examId,
      userId: userId,
      startTime: Date.now(),
      answers: new Array(exam.questions.length).fill(-1),
      totalQuestions: exam.questions.length,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Save an answer into the current session.
   * @param {number} questionIndex
   * @param {number} answerIndex  0-3
   */
  function saveAnswer(questionIndex, answerIndex) {
    var session = getExamSession();
    if (!session) return;
    session.answers[questionIndex] = answerIndex;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // ─── Scoring ──────────────────────────────────────────────

  /**
   * @param {Array} questions
   * @param {number[]} answers
   * @returns {{ score: number, correct: number, total: number }}
   */
  function calculateScore(questions, answers) {
    var correct = 0;
    for (var i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) correct++;
    }
    var total = questions.length;
    var score = total === 0 ? 0 : parseFloat(((correct / total) * 10).toFixed(1));
    return { score: score, correct: correct, total: total };
  }

  /**
   * Submit the current exam session and persist the result.
   * Clears the session from localStorage.
   * @returns {object|null} ExamResult or null if no active session
   */
  function submitExam() {
    var session = getExamSession();
    if (!session) return null;

    var exam = DataService.getExamById(session.examId);
    if (!exam) return null;

    var user = DataService.getUserById(session.userId);
    var username = user ? user.username : 'unknown';

    var scored = calculateScore(exam.questions, session.answers);
    var durationSec = Math.floor((Date.now() - session.startTime) / 1000);

    var result = {
      id: DataService.generateId(),
      examId: session.examId,
      examName: exam.name,
      userId: session.userId,
      username: username,
      score: scored.score,
      correct: scored.correct,
      total: scored.total,
      answers: session.answers.slice(),
      submittedAt: new Date().toISOString(),
      duration: durationSec,
    };

    DataService.saveResult(result);
    localStorage.removeItem(SESSION_KEY);
    return result;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    getAvailableExams,
    isExamAvailable,
    getExamSession,
    startExam,
    saveAnswer,
    calculateScore,
    submitExam,
  };
})();
