/**
 * exam.js - Exam taking page via backend API.
 * Depends on: AuthService, ExamService
 */
(function () {
  AuthService.guardUserPage();

  var currentUser = AuthService.getCurrentUser();
  document.getElementById('navUsername').textContent = '\uD83D\uDC64 ' + currentUser.username;

  var params = new URLSearchParams(window.location.search);
  var examId = params.get('id');
  if (!examId) {
    window.location.href = 'index.html';
    return;
  }

  var exam = null;
  var session = null;
  var questions = [];
  var totalQ = 0;
  var currentIndex = 0;
  var timerInterval = null;

  init().catch(function (err) {
    alert('Không tải được đề thi: ' + (err.message || err));
    window.location.href = 'index.html';
  });

  async function init() {
    exam = await ExamService.getExamDetail(examId);
    questions = exam.questions || [];
    if (!questions.length) {
      window.location.href = 'index.html';
      return;
    }

    session = await ExamService.startExam(examId, currentUser.id);
    totalQ = questions.length;

    document.getElementById('examTitle').textContent = exam.name;
    document.getElementById('examSubtitle').textContent =
      totalQ + ' câu hỏi • ' + (exam.durationMinutes || 0) + ' phút';

    renderQuestion(currentIndex);
    buildNavGrid();
    startTimer();
  }

  function startTimer() {
    function tick() {
      session = ExamService.getExamSession();
      if (!session) return;
      var totalSec = (session.durationMinutes || 30) * 60;
      var elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      var remaining = Math.max(0, totalSec - elapsed);

      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      var el = document.getElementById('timerDisplay');
      el.textContent = pad(m) + ':' + pad(s);

      if (remaining <= 60) {
        el.classList.remove('exam-timer__value--warning');
        el.classList.add('exam-timer__value--danger');
      } else if (remaining <= 300) {
        el.classList.remove('exam-timer__value--danger');
        el.classList.add('exam-timer__value--warning');
      }

      if (remaining === 0) {
        clearInterval(timerInterval);
        doSubmit(true);
      }
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function renderQuestion(idx) {
    currentIndex = idx;
    var q = questions[idx];
    session = ExamService.getExamSession();
    var answers = session ? session.answers : [];

    document.getElementById('questionNumber').textContent = 'Câu ' + (idx + 1) + ' / ' + totalQ;
    document.getElementById('questionText').textContent = q.text;

    var optList = document.getElementById('optionsList');
    optList.innerHTML = '';
    var labels = ['A', 'B', 'C', 'D'];

    (q.options || []).forEach(function (opt, i) {
      var selected = answers[idx] === i;
      var item = document.createElement('div');
      item.className = 'option-item' + (selected ? ' option-item--selected' : '');
      item.setAttribute('data-option', i);
      item.innerHTML =
        '<span class="option-label">' + labels[i] + '</span>' +
        '<span class="option-text">' + escHtml(opt) + '</span>';
      item.addEventListener('click', function () {
        selectAnswer(idx, i);
      });
      optList.appendChild(item);
    });

    document.getElementById('progressLabel').textContent =
      'Da tra loi: ' + countAnswered() + '/' + totalQ;
    document.getElementById('btnPrev').disabled = idx === 0;
    document.getElementById('btnNext').disabled = idx === totalQ - 1;
    updateNavGrid();
  }

  async function selectAnswer(qIdx, optIdx) {
    try {
      await ExamService.saveAnswer(qIdx, optIdx);
      renderQuestion(qIdx);
    } catch (err) {
      alert('Không lưu được đáp án: ' + (err.message || err));
    }
  }

  function countAnswered() {
    session = ExamService.getExamSession();
    if (!session) return 0;
    return session.answers.filter(function (a) { return a >= 0; }).length;
  }

  function buildNavGrid() {
    var grid = document.getElementById('qNavGrid');
    grid.innerHTML = '';
    for (var i = 0; i < totalQ; i++) {
      var btn = document.createElement('button');
      btn.className = 'q-nav__btn';
      btn.textContent = i + 1;
      btn.setAttribute('data-qidx', i);
      btn.addEventListener('click', (function (idx) {
        return function () { renderQuestion(idx); };
      })(i));
      grid.appendChild(btn);
    }
    updateNavGrid();
  }

  function updateNavGrid() {
    session = ExamService.getExamSession();
    var answers = session ? session.answers : [];
    var btns = document.querySelectorAll('.q-nav__btn');
    btns.forEach(function (btn, i) {
      btn.className = 'q-nav__btn';
      if (answers[i] >= 0) btn.classList.add('q-nav__btn--answered');
      if (i === currentIndex) btn.classList.add('q-nav__btn--current');
    });
  }

  document.getElementById('btnPrev').addEventListener('click', function () {
    if (currentIndex > 0) renderQuestion(currentIndex - 1);
  });

  document.getElementById('btnNext').addEventListener('click', function () {
    if (currentIndex < totalQ - 1) renderQuestion(currentIndex + 1);
  });

  document.getElementById('btnSubmit').addEventListener('click', function () {
    var unanswered = totalQ - countAnswered();
    var msg = unanswered > 0
      ? 'Bạn còn ' + unanswered + ' câu chưa trả lời. Bạn có chắc muốn nộp bài?'
      : 'Bạn đã trả lời tất cả ' + totalQ + ' câu. Xác nhận nộp bài?';
    document.getElementById('submitModalBody').textContent = msg;
    document.getElementById('submitModal').classList.remove('hidden');
  });

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelSubmit').addEventListener('click', closeModal);
  document.getElementById('confirmSubmit').addEventListener('click', function () { doSubmit(false); });

  function closeModal() {
    document.getElementById('submitModal').classList.add('hidden');
  }

  async function doSubmit() {
    clearInterval(timerInterval);
    try {
      var result = await ExamService.submitExam();
      if (result && result.id) {
        window.location.href = 'result.html?id=' + encodeURIComponent(result.id);
      } else {
        window.location.href = 'index.html';
      }
    } catch (err) {
      alert('Nộp bài thất bại: ' + (err.message || err));
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();


