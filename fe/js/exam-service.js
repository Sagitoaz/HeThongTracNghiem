/**
 * exam-service.js - Exam flow via backend API.
 * Depends on: ApiClient
 */
const ExamService = (function () {
  var SESSION_KEY = 'httn_exam_session';

  function getExamSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async function getAvailableExams() {
    var data = await ApiClient.request('/exams?page=0&size=100');
    return data.content || [];
  }

  function isExamAvailable(exam) {
    if (typeof exam.isAvailable === 'boolean') return exam.isAvailable;
    if (exam.type === 'free') return true;
    if (exam.type === 'scheduled') {
      if (!exam.startTime) return false;
      return new Date(exam.startTime).getTime() <= Date.now();
    }
    return false;
  }

  async function getExamDetail(examId) {
    return ApiClient.request('/exams/' + encodeURIComponent(examId));
  }

  async function startExam(examId, userId) {
    var existing = getExamSession();
    if (existing && existing.examId === examId && existing.userId === userId && !existing.submitted) {
      return existing;
    }

    var exam = await getExamDetail(examId);
    var started = await ApiClient.request('/exams/' + encodeURIComponent(examId) + '/attempts/start', {
      method: 'POST',
      body: null,
      headers: {},
    });

    var questions = exam.questions || [];
    var session = {
      attemptId: started.attemptId,
      examId: examId,
      userId: userId,
      examName: exam.name,
      durationMinutes: exam.durationMinutes || exam.duration || 30,
      questionIds: questions.map(function (q) { return q.id; }),
      answers: new Array(questions.length).fill(-1),
      startTime: Date.now(),
      submitted: false,
    };

    saveSession(session);
    return session;
  }

  async function saveAnswer(questionIndex, answerIndex) {
    var session = getExamSession();
    if (!session) return;
    var questionId = session.questionIds[questionIndex];
    if (!questionId) return;

    await ApiClient.request('/attempts/' + encodeURIComponent(session.attemptId) + '/answers', {
      method: 'PUT',
      body: JSON.stringify({ questionId: questionId, selectedOptionIndex: answerIndex }),
    });

    session.answers[questionIndex] = answerIndex;
    saveSession(session);
  }

  async function submitExam() {
    var session = getExamSession();
    if (!session) return null;

    var submitted = await ApiClient.request('/attempts/' + encodeURIComponent(session.attemptId) + '/submit', {
      method: 'POST',
      body: null,
      headers: {},
    });

    session.submitted = true;
    saveSession(session);

    var resultId = submitted.resultId;
    localStorage.removeItem(SESSION_KEY);
    return { id: resultId };
  }

  async function getResultDetail(resultId) {
    return ApiClient.request('/results/' + encodeURIComponent(resultId));
  }

  return {
    getAvailableExams,
    isExamAvailable,
    getExamSession,
    getExamDetail,
    startExam,
    saveAnswer,
    submitExam,
    getResultDetail,
  };
})();
