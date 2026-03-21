// exam.js - Trang lam bai thi qua backend API

const params = new URLSearchParams(window.location.search);
const examId = params.get('id');

let exam = null;
let questions = [];
let currentQuestionIndex = 0;
let session = null;
let timerInterval = null;

const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const answerDiv = document.getElementById('answer');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const submitBtn = document.getElementById('submit');
const answeredCount = document.getElementById('answered-count');
const timeDisplay = document.getElementById('time');

function requireStudent() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || !t) {
    window.location.href = './login.html';
    return null;
  }
  document.getElementById('headerUser').textContent = u.username || '';
  return u;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getRemainingSeconds() {
  const total = (session.durationMinutes || 30) * 60;
  const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
  return Math.max(0, total - elapsed);
}

function startTimer() {
  const tick = () => {
    const remaining = getRemainingSeconds();
    timeDisplay.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      submitExam(true);
    }
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

async function submitExam(timeUp = false) {
  if (!timeUp) {
    const unanswered = session.answers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      const confirmed = confirm(`Ban con ${unanswered} cau chua tra loi. Xac nhan nop bai?`);
      if (!confirmed) return;
    }
  }

  try {
    const res = await ApiClient.request(`/attempts/${encodeURIComponent(session.attemptId)}/submit`, {
      method: 'POST',
      body: null,
      headers: {},
    });

    clearInterval(timerInterval);
    timerInterval = null;
    localStorage.removeItem('ptit_exam_session');
    window.location.href = './result.html?id=' + encodeURIComponent(res.resultId);
  } catch (err) {
    alert('Nop bai that bai: ' + (err.message || err));
  }
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  questionNumber.textContent = `CAU ${currentQuestionIndex + 1}/${questions.length}`;
  questionText.textContent = question.text;

  answerDiv.innerHTML = '';
  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'answer-btn';
    if (session.answers[currentQuestionIndex] === index) btn.classList.add('selected');
    btn.onclick = () => selectAnswer(index);
    answerDiv.appendChild(btn);
  });

  const answered = session.answers.filter((a) => a !== -1).length;
  answeredCount.textContent = `Da tra loi: ${answered}/${questions.length}`;

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = currentQuestionIndex === questions.length - 1;
}

async function selectAnswer(index) {
  const question = questions[currentQuestionIndex];
  try {
    await ApiClient.request(`/attempts/${encodeURIComponent(session.attemptId)}/answers`, {
      method: 'PUT',
      body: JSON.stringify({
        questionId: question.id,
        selectedOptionIndex: index,
      }),
    });

    session.answers[currentQuestionIndex] = index;
    localStorage.setItem('ptit_exam_session', JSON.stringify(session));
    renderQuestion();
  } catch (err) {
    alert('Khong luu duoc dap an: ' + (err.message || err));
  }
}

prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
};

nextBtn.onclick = () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
};

submitBtn.onclick = () => submitExam(false);

document.querySelector('.ptit-logout').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

async function init() {
  const user = requireStudent();
  if (!user) return;
  if (!examId) {
    window.location.href = './index.html';
    return;
  }

  try {
    exam = await ApiClient.request('/exams/' + encodeURIComponent(examId));
    questions = exam.questions || [];
    if (!questions.length) {
      alert('De thi khong co cau hoi.');
      window.location.href = './index.html';
      return;
    }

    const started = await ApiClient.request('/exams/' + encodeURIComponent(examId) + '/attempts/start', {
      method: 'POST',
      body: null,
      headers: {},
    });

    session = {
      attemptId: started.attemptId,
      examId,
      durationMinutes: started.durationMinutes || exam.durationMinutes || 30,
      startTime: Date.now(),
      answers: new Array(questions.length).fill(-1),
    };
    localStorage.setItem('ptit_exam_session', JSON.stringify(session));

    document.getElementById('exam-title').textContent = exam.name || 'Bai thi';
    document.getElementById('exam-info').textContent = `${questions.length} cau hoi • ${session.durationMinutes} phut`;

    renderQuestion();
    startTimer();
  } catch (err) {
    alert('Khong tai duoc bai thi: ' + (err.message || err));
    window.location.href = './index.html';
  }
}

init();
