/**
 * result.js — Result page controller
 * Depends on: DataService, AuthService, Chart.js (CDN)
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

  // ─── Load result ───────────────────────────────────────

  var params = new URLSearchParams(window.location.search);
  var resultId = params.get('id');
  if (!resultId) {
    window.location.href = 'index.html';
    return;
  }

  var allResults = DataService.getResults();
  var result = allResults.find(function (r) { return r.id === resultId; });
  if (!result) {
    window.location.href = 'index.html';
    return;
  }

  var exam = DataService.getExamById(result.examId);

  // ─── Score hero ────────────────────────────────────────

  document.getElementById('scoreDisplay').textContent = result.score.toFixed(1);
  document.getElementById('scoreFraction').textContent =
    result.correct + '/' + result.total + ' câu đúng';

  // ─── Stats row ─────────────────────────────────────────

  var dMin = Math.floor(result.duration / 60);
  var dSec = result.duration % 60;
  var dStr = dMin + ' phút ' + (dSec > 0 ? dSec + ' giây' : '');

  var statsData = [
    { label: 'Bài thi',       value: result.examName },
    { label: 'Điểm số',       value: result.score.toFixed(1) + ' / 10' },
    { label: 'Số câu đúng',   value: result.correct + ' / ' + result.total },
    { label: 'Thời gian làm', value: dStr },
    { label: 'Nộp lúc',       value: formatDateTime(result.submittedAt) },
  ];

  var statsHtml = statsData.map(function (s) {
    return '<div class="result-stat-card">' +
      '<div class="result-stat-card__label">' + escHtml(s.label) + '</div>' +
      '<div class="result-stat-card__value">' + escHtml(String(s.value)) + '</div>' +
      '</div>';
  }).join('');
  document.getElementById('resultStats').innerHTML = statsHtml;

  // ─── Chart ────────────────────────────────────────────

  var wrong = result.total - result.correct;
  var ctx = document.getElementById('resultChart');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Câu đúng', 'Câu sai'],
        datasets: [{
          data: [result.correct, wrong],
          backgroundColor: ['#28A745', '#DC3545'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ctx.label + ': ' + ctx.parsed + ' câu';
              },
            },
          },
        },
        cutout: '62%',
      },
    });
  }

  // ─── Review ───────────────────────────────────────────

  var reviewArea = document.getElementById('reviewArea');
  if (!exam || !exam.questions) {
    reviewArea.innerHTML = '<p class="text-sec text-sm" style="padding:16px">Không tải được dữ liệu câu hỏi.</p>';
  } else {
    var labels = ['A', 'B', 'C', 'D'];
    var reviewHtml = exam.questions.map(function (q, idx) {
      var userAns = result.answers[idx];
      var correct = q.correctAnswer;

      var optionsHtml = q.options.map(function (opt, i) {
        var cls = 'option-item';
        if (i === correct) cls += ' option-item--correct';
        else if (i === userAns && i !== correct) cls += ' option-item--wrong';
        return '<div class="' + cls + '">' +
          '<span class="option-label">' + labels[i] + '</span>' +
          '<span class="option-text">' + escHtml(opt) + '</span>' +
          '</div>';
      }).join('');

      var statusBadge = (userAns === correct)
        ? '<span class="badge badge--success">✓ Đúng</span>'
        : (userAns === undefined || userAns === null)
          ? '<span class="badge badge--warning">— Bỏ qua</span>'
          : '<span class="badge badge--danger">✗ Sai</span>';

      var explanationHtml = q.explanation
        ? '<div class="explanation-block">💡 ' + escHtml(q.explanation) + '</div>'
        : '';

      return '<div class="question-card">' +
        '<div class="review-question-header">' +
          '<span class="review-question-num">Câu ' + (idx + 1) + '</span>' +
          statusBadge +
        '</div>' +
        '<div class="question-card__text">' + escHtml(q.text) + '</div>' +
        '<div class="options-list">' + optionsHtml + '</div>' +
        explanationHtml +
        '</div>';
    }).join('');
    reviewArea.innerHTML = reviewHtml;
  }

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
