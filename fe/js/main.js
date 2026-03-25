/**
 * main.js - Index page controller (exam list) via backend.
 * Depends on: AuthService, ExamService
 */
(function () {
  AuthService.guardUserPage();

  var currentUser = AuthService.getCurrentUser();
  document.getElementById('navUsername').textContent = '\uD83D\uDC64 ' + currentUser.username;

  document.getElementById('btnLogout').addEventListener('click', function () {
    AuthService.logout();
  });

  var allExams = [];

  init().catch(function (err) {
    alert('Không tải được danh sách đề thi: ' + (err.message || err));
  });

  async function init() {
    allExams = await ExamService.getAvailableExams();
    renderExams(allExams);
  }

  function renderExams(exams) {
    var grid = document.getElementById('examGrid');
    var empty = document.getElementById('emptyState');
    grid.innerHTML = '';

    if (exams.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    exams.forEach(function (exam) {
      var available = ExamService.isExamAvailable(exam);
      var card = document.createElement('div');
      card.className = 'exam-card' + (available ? '' : ' exam-card--locked');

      var typeLabel = exam.type === 'free' ? 'Tự do' : 'Có lịch';
      var typeBadge = exam.type === 'free'
        ? '<span class="badge badge--success">' + typeLabel + '</span>'
        : '<span class="badge badge--warning">' + typeLabel + '</span>';

      var scheduledLine = '';
      if (exam.type === 'scheduled' && exam.startTime && !available) {
        scheduledLine = '<div class="exam-card__scheduled-time">\uD83D\uDD50 Bắt đầu lúc: ' +
          formatDateTime(exam.startTime) + '</div>';
      }

      var qCount = exam.questionCount || (Array.isArray(exam.questions) ? exam.questions.length : 0);
      var duration = exam.durationMinutes || exam.duration || 0;

      card.innerHTML =
        '<div class="exam-card__meta">' + typeBadge + '</div>' +
        '<h3 class="exam-card__name">' + escHtml(exam.name) + '</h3>' +
        '<p class="exam-card__desc">' + escHtml(exam.description || '') + '</p>' +
        '<div class="exam-card__info">' +
          '<span class="exam-card__info-item">\u23F1 ' + duration + ' phút</span>' +
          '<span class="exam-card__info-item">\uD83D\uDCDD ' + qCount + ' câu</span>' +
        '</div>' +
        scheduledLine +
        '<button class="btn btn--primary" data-exam-id="' + exam.id + '"' +
          (available ? '' : ' disabled') + '>' +
          (available ? 'Bắt đầu làm bài' : 'Chưa đến giờ') +
        '</button>';

      grid.appendChild(card);
    });

    grid.querySelectorAll('[data-exam-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var examId = this.getAttribute('data-exam-id');
        window.location.href = 'exam.html?id=' + encodeURIComponent(examId);
      });
    });
  }

  document.getElementById('searchInput').addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    if (!q) {
      renderExams(allExams);
      return;
    }
    var filtered = allExams.filter(function (e) {
      return (e.name || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q);
    });
    renderExams(filtered);
  });

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDateTime(iso) {
    var d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
})();



