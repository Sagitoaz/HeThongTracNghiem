/**
 * main.js — Index page controller (exam list)
 * Depends on: DataService, AuthService, ExamService
 */
(function () {
  // ─── Init ──────────────────────────────────────────────
  DataService.init();
  AuthService.guardUserPage();

  var currentUser = AuthService.getCurrentUser();
  document.getElementById('navUsername').textContent = '👤 ' + currentUser.username;

  document.getElementById('btnLogout').addEventListener('click', function () {
    AuthService.logout();
  });

  // ─── Render ────────────────────────────────────────────

  var allExams = ExamService.getAvailableExams();
  renderExams(allExams);

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
        scheduledLine = '<div class="exam-card__scheduled-time">🕐 Bắt đầu lúc: ' +
          formatDateTime(exam.startTime) + '</div>';
      }

      var qCount = Array.isArray(exam.questions) ? exam.questions.length : 0;

      card.innerHTML =
        '<div class="exam-card__meta">' + typeBadge + '</div>' +
        '<h3 class="exam-card__name">' + escHtml(exam.name) + '</h3>' +
        '<p class="exam-card__desc">' + escHtml(exam.description || '') + '</p>' +
        '<div class="exam-card__info">' +
          '<span class="exam-card__info-item">⏱ ' + exam.duration + ' phút</span>' +
          '<span class="exam-card__info-item">📝 ' + qCount + ' câu</span>' +
        '</div>' +
        scheduledLine +
        '<button class="btn btn--primary" data-exam-id="' + exam.id + '"' +
          (available ? '' : ' disabled') + '>' +
          (available ? 'Bắt đầu làm bài' : '🔒 Chưa đến giờ') +
        '</button>';

      grid.appendChild(card);
    });

    // Attach click handlers
    grid.querySelectorAll('[data-exam-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var examId = this.getAttribute('data-exam-id');
        ExamService.startExam(examId, currentUser.id);
        window.location.href = 'exam.html?id=' + encodeURIComponent(examId);
      });
    });
  }

  // ─── Search ────────────────────────────────────────────

  document.getElementById('searchInput').addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    if (!q) {
      renderExams(allExams);
      return;
    }
    var filtered = allExams.filter(function (e) {
      return e.name.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q);
    });
    renderExams(filtered);
  });

  // ─── Utils ────────────────────────────────────────────

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
