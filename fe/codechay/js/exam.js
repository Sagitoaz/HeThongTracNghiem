// exam.js — Trang làm bài thi (codechay/exam.html)

const params = new URLSearchParams(window.location.search);
const examIndex = params.get("exam");

const questions = MockData.exams[examIndex].questions;
const duration  = MockData.exams[examIndex].duration;

let currentQuestionIndex = 0;
let userAnswers = new Array(questions.length).fill(null);

const questionNumber = document.getElementById('question-number');
const questionText   = document.getElementById('question-text');
const answerDiv      = document.getElementById('answer');
const prevBtn        = document.getElementById('prev');
const nextBtn        = document.getElementById('next');
const submitBtn      = document.getElementById('submit');
const answeredCount  = document.getElementById('answered-count');
const timeDisplay    = document.getElementById('time');

let timeRemaining = duration * 60;
let timerInterval = null;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const startTimer = () => {
  timeDisplay.textContent = formatTime(timeRemaining);
  timerInterval = setInterval(() => {
    timeRemaining--;
    timeDisplay.textContent = formatTime(timeRemaining);
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      submitExam(true);
    }
  }, 1000);
};

const submitExam = (timeUp = false) => {
  if (!timeUp) {
    const unanswered = userAnswers.filter(a => a === null).length;
    if (unanswered > 0) {
      const confirmed = confirm(`Bạn còn ${unanswered} câu chưa trả lời. Xác nhận nộp bài?`);
      if (!confirmed) return;
    }
  }

  let correct = 0;
  userAnswers.forEach((answer, index) => {
    if (answer === questions[index].correctAnswer) correct++;
  });

  const totalSeconds = duration * 60;
  const timeSpentSec = totalSeconds - Math.max(0, timeRemaining);
  const mm = Math.floor(timeSpentSec / 60);
  const ss = timeSpentSec % 60;

  const examData = MockData.exams[examIndex];
  const userStr  = localStorage.getItem('ptit_user');
  const username = userStr ? JSON.parse(userStr).username : 'sv001';

  const resultPayload = {
    username,
    exam: examData.name,
    score: parseFloat(((correct / questions.length) * 10).toFixed(1)),
    correct,
    total: questions.length,
    duration: `${mm}m ${String(ss).padStart(2, '0')}s`,
    submittedAt: new Date().toLocaleString('vi-VN'),
    questions: questions.map((q, idx) => ({
      number: idx + 1,
      text: q.text,
      options: q.options,
      correctIndex: q.correctAnswer,
      chosenIndex: userAnswers[idx] !== null ? userAnswers[idx] : -1,
      explain: q.explanation || ''
    }))
  };

  clearInterval(timerInterval);
  timerInterval = null;
  sessionStorage.setItem('ptit_exam_result', JSON.stringify(resultPayload));

  // exam.html is at codechay/ root → result.html is also at root
  window.location.href = './result.html';
};

const renderQuestion = () => {
  const question = questions[currentQuestionIndex];

  questionNumber.textContent = `CÂU ${currentQuestionIndex + 1}/${questions.length}`;
  questionText.textContent = question.text;

  answerDiv.innerHTML = '';
  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'answer-btn';
    if (userAnswers[currentQuestionIndex] === index) {
      btn.classList.add('selected');
    }
    btn.onclick = () => selectAnswer(index);
    answerDiv.appendChild(btn);
  });

  const answered = userAnswers.filter(a => a !== null).length;
  answeredCount.textContent = `Đã trả lời: ${answered}/${questions.length}`;

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = currentQuestionIndex === questions.length - 1;
};

const selectAnswer = (index) => {
  userAnswers[currentQuestionIndex] = index;
  renderQuestion();
};

prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) { currentQuestionIndex--; renderQuestion(); }
};

nextBtn.onclick = () => {
  if (currentQuestionIndex < questions.length - 1) { currentQuestionIndex++; renderQuestion(); }
};

submitBtn.onclick = () => submitExam();

renderQuestion();
startTimer();
