/**
 * dashboard.js — Admin dashboard controller
 * Depends on: DataService, AuthService
 */
(function () {
  DataService.init();
  AuthService.guardAdminPage();

  var admin = AuthService.getCurrentAdmin();
  document.getElementById('adminUsername').textContent = '🔑 ' + admin.username;

  document.getElementById('btnLogout').addEventListener('click', function () {
    AuthService.logoutAdmin();
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  });

  // ─── Stats ──────────────────────────────────────────────

  var users = DataService.getUsers().filter(function (u) { return u.role === 'user'; });
  var exams = DataService.getExams();
  var results = DataService.getResults();

  var avgScore = results.length === 0 ? 0 :
    parseFloat((results.reduce(function (s, r) { return s + r.score; }, 0) / results.length).toFixed(1));

  var statsData = [
    { icon: '👥', label: 'Sinh viên', value: users.length },
    { icon: '📝', label: 'Đề thi', value: exams.length },
    { icon: '📋', label: 'Lượt nộp', value: results.length },
    { icon: '⭐', label: 'Điểm TB', value: avgScore + '/10' },
  ];

  var statsHtml = statsData.map(function (s) {
    return '<div class="admin-stat">' +
      '<div class="admin-stat__icon">' + s.icon + '</div>' +
      '<div class="admin-stat__value">' + s.value + '</div>' +
      '<div class="admin-stat__label">' + escHtml(s.label) + '</div>' +
      '</div>';
  }).join('');
  document.getElementById('statsGrid').innerHTML = statsHtml;

  // ─── Recent submissions ─────────────────────────────────

  var recent = results.slice().sort(function (a, b) {
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  }).slice(0, 10);

  var tbodyHtml = recent.length === 0
    ? '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Chưa có lượt nộp bài nào.</td></tr>'
    : recent.map(function (r) {
        var scoreClass = r.score >= 8 ? 'text-success' : r.score >= 5 ? '' : 'text-danger';
        return '<tr>' +
          '<td>' + escHtml(r.username) + '</td>' +
          '<td>' + escHtml(r.examName) + '</td>' +
          '<td><strong class="' + scoreClass + '">' + r.score.toFixed(1) + '</strong></td>' +
          '<td>' + r.correct + '/' + r.total + '</td>' +
          '<td>' + formatDateTime(r.submittedAt) + '</td>' +
          '</tr>';
      }).join('');

  document.getElementById('recentTbody').innerHTML = tbodyHtml;

  // ─── Utils ────────────────────────────────────────────

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function formatDateTime(iso) {
    return new Date(iso).toLocaleString('vi-VN', {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit',
    });
  }
})();
