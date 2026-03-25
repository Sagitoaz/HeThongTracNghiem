/**
 * result.js - Result page controller via backend API.
 * Depends on: AuthService, ExamService, Chart.js
 */
(function () {
  AuthService.guardUserPage();

  var currentUser = AuthService.getCurrentUser();
  document.getElementById('navUsername').textContent = '\uD83D\uDC64 ' + currentUser.username;

  document.getElementById('btnLogout').addEventListener('click', function () {
    AuthService.logout();
  });

  init().catch(function (err) {
    alert('Không tải được kết quả: ' + (err.message || err));
    window.location.href = 'index.html';
  });

  async function init() {
    var params = new URLSearchParams(window.location.search);
    var resultId = params.get('id');
    if (!resultId) {
      window.location.href = 'index.html';
      return;
    }

    var result = await ExamService.getResultDetail(resultId);
    var examId = result.examId || result.examid;
    if (!examId) {
      throw new Error('Không tìm thấy examId trong kết quả.');
    }
    var exam = await ExamService.getExamDetail(examId);

    document.getElementById('scoreDisplay').textContent = Number(result.score || 0).toFixed(1);
    document.getElementById('scoreFraction').textContent = result.correct + '/' + result.total + ' câu đúng';

    var statsData = [
      { label: 'Bài thi', value: result.examName || exam.name },
      { label: 'Điểm số', value: Number(result.score || 0).toFixed(1) + ' / 10' },
      { label: 'Số câu đúng', value: result.correct + ' / ' + result.total },
      { label: 'Nộp bài', value: 'Đã nộp thành công' },
    ];

    document.getElementById('resultStats').innerHTML = statsData.map(function (s) {
      return '<div class="result-stat-card">' +
        '<div class="result-stat-card__label">' + escHtml(s.label) + '</div>' +
        '<div class="result-stat-card__value">' + escHtml(String(s.value)) + '</div>' +
      '</div>';
    }).join('');

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
        options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '62%' },
      });
    }

    var answersByQid = {};
    (result.answers || []).forEach(function (a) {
      var qid = a.questionId || a.questionid;
      if (qid) answersByQid[qid] = a;
    });

    var labels = ['A', 'B', 'C', 'D'];
    var reviewArea = document.getElementById('reviewArea');
    reviewArea.innerHTML = (exam.questions || []).map(function (q, idx) {
      var answer = answersByQid[q.id] || {};
      var userAns = answer.selectedOptionIndex;
      if (userAns === undefined) userAns = answer.selectedoptionindex;
      var correct = answer.correctOptionIndex;
      if (correct === undefined) correct = answer.correctoptionindex;
      var isCorrect = answer.isCorrect === true || answer.iscorrect === true;

      var optionsHtml = (q.options || []).map(function (opt, i) {
        var cls = 'option-item';
        if (i === correct) cls += ' option-item--correct';
        else if (i === userAns && !isCorrect) cls += ' option-item--wrong';
        return '<div class="' + cls + '">' +
          '<span class="option-label">' + labels[i] + '</span>' +
          '<span class="option-text">' + escHtml(opt) + '</span>' +
        '</div>';
      }).join('');

      var statusBadge = isCorrect
        ? '<span class="badge badge--success">Đúng</span>'
        : '<span class="badge badge--danger">Sai</span>';

      var explanation = answer.explanation || '';
      var explanationHtml = explanation
        ? '<div class="explanation-block">\uD83D\uDCA1 ' + escHtml(explanation) + '</div>'
        : '';

      return '<div class="question-card">' +
        '<div class="review-question-header">' +
          '<span class="review-question-num">Câu ' + (idx + 1) + '</span>' + statusBadge +
        '</div>' +
        '<div class="question-card__text">' + escHtml(q.text) + '</div>' +
        '<div class="options-list">' + optionsHtml + '</div>' +
        explanationHtml +
      '</div>';
    }).join('');
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();


