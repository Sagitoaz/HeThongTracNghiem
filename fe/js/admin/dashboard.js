/**
 * dashboard.js - Admin dashboard via backend API.
 * Depends on: AuthService, ApiClient
 */
(function () {
  AuthService.guardAdminPage();

  var admin = AuthService.getCurrentAdmin();
  document.getElementById('adminUsername').textContent = '\uD83D\uDC64 ' + admin.username;

  document.getElementById('btnLogout').addEventListener('click', function () {
    AuthService.logoutAdmin();
  });

  document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  });

  init().catch(function (err) {
    alert('Không tải được bảng điều khiển: ' + (err.message || err));
  });

  async function init() {
    var overview = await ApiClient.request('/admin/statistics/overview');

    var statsData = [
      { icon: '\uD83D\uDC65', label: 'Sinh viên', value: overview.totalStudents || 0 },
      { icon: '\uD83D\uDC65', label: 'Đề thi', value: overview.totalExams || 0 },
      { icon: '\uD83D\uDC65', label: 'Lượt nộp', value: overview.totalAttempts || 0 },
      { icon: '\u2B50', label: 'Điểm TB', value: Number(overview.averageScore || 0).toFixed(1) + '/10' },
    ];

    document.getElementById('statsGrid').innerHTML = statsData.map(function (s) {
      return '<div class="admin-stat">' +
        '<div class="admin-stat__icon">' + s.icon + '</div>' +
        '<div class="admin-stat__value">' + s.value + '</div>' +
        '<div class="admin-stat__label">' + escHtml(s.label) + '</div>' +
      '</div>';
    }).join('');

    await renderRecentResults();
  }

  async function renderRecentResults() {
    var tbody = document.getElementById('recentTbody');
    try {
      var res = await ApiClient.request('/admin/results?page=0&size=10');
      var rows = (res.content || []).slice().sort(function (a, b) {
        return new Date(b.submittedAt || b.submittedat || 0) - new Date(a.submittedAt || a.submittedat || 0);
      });

      if (!rows.length) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Chưa có lượt nộp nào.</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map(function (r) {
        var cls = Number(r.score || 0) >= 8 ? 'text-success' : Number(r.score || 0) >= 5 ? '' : 'text-danger';
        return '<tr>' +
          '<td>' + escHtml(r.username || '') + '</td>' +
          '<td>' + escHtml(r.examName || '') + '</td>' +
          '<td><strong class="' + cls + '">' + Number(r.score || 0).toFixed(1) + '</strong></td>' +
          '<td>' + Number(r.correct || 0) + '/' + Number(r.total || 0) + '</td>' +
          '<td>' + formatDateTime(r.submittedAt || r.submittedat) + '</td>' +
          '</tr>';
      }).join('');
    } catch (err) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Lỗi tải lượt nộp gần đây: ' +
        escHtml(err.message || String(err)) + '</td></tr>';
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
})();


