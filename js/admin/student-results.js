/**
 * student-results.js — Admin student results page controller
 * Depends on: DataService, AuthService, ExportService
 */
(function () {
  DataService.init();
  AuthService.guardAdminPage();

  var admin = AuthService.getCurrentAdmin();
  document.getElementById('adminUsername').textContent = '🔑 ' + admin.username;
  document.getElementById('btnLogout').addEventListener('click', function () { AuthService.logoutAdmin(); });
  document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  });

  // ─── Populate exam filter ──────────────────────────────

  var exams = DataService.getExams();
  var examSelect = document.getElementById('filterExam');
  examSelect.innerHTML = '<option value="">Tất cả</option>' +
    exams.map(function (e) {
      return '<option value="' + e.id + '">' + escHtml(e.name) + '</option>';
    }).join('');

  // ─── Filter & render ──────────────────────────────────

  function getFiltered() {
    var username = document.getElementById('filterUsername').value.trim().toLowerCase();
    var examId   = document.getElementById('filterExam').value;
    var results  = DataService.getResults();

    if (username) {
      results = results.filter(function (r) {
        return r.username.toLowerCase().includes(username);
      });
    }
    if (examId) {
      results = results.filter(function (r) { return r.examId === examId; });
    }
    return results;
  }

  function renderTable() {
    var results = getFiltered().sort(function (a, b) {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    document.getElementById('resultCount').textContent = results.length;
    var tbody = document.getElementById('resultsTbody');

    if (results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-sec" style="padding:20px">Không tìm thấy kết quả.</td></tr>';
      return;
    }

    tbody.innerHTML = results.map(function (r) {
      var cls = r.score >= 8 ? 'text-success' : r.score >= 5 ? '' : 'text-danger';
      var dMin = Math.floor(r.duration / 60);
      var dSec = r.duration % 60;
      return '<tr>' +
        '<td>' + escHtml(r.username) + '</td>' +
        '<td>' + escHtml(r.examName) + '</td>' +
        '<td><strong class="' + cls + '">' + r.score.toFixed(1) + '</strong></td>' +
        '<td>' + r.correct + '/' + r.total + '</td>' +
        '<td>' + dMin + 'm ' + dSec + 's</td>' +
        '<td>' + formatDateTime(r.submittedAt) + '</td>' +
        '<td>' +
          '<button class="btn btn--ghost btn--sm" onclick="exportStudentPDF(\'' + escHtml(r.userId) + '\')" ' +
          'title="Xuất PDF kết quả của sinh viên này">📄 PDF</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  renderTable();

  // ─── Filter events ─────────────────────────────────────

  document.getElementById('filterUsername').addEventListener('input', renderTable);
  document.getElementById('filterExam').addEventListener('change', renderTable);

  document.getElementById('btnClearFilter').addEventListener('click', function () {
    document.getElementById('filterUsername').value = '';
    document.getElementById('filterExam').value = '';
    renderTable();
  });

  // ─── Export PDF ────────────────────────────────────────

  window.exportStudentPDF = function (userId) {
    var student = DataService.getUserById(userId);
    if (!student) { alert('Không tìm thấy sinh viên.'); return; }
    var results = DataService.getResultsByUser(userId);
    ExportService.exportStudentResultPDF(student, results);
  };

  // ─── Utils ────────────────────────────────────────────

  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function formatDateTime(iso) {
    return new Date(iso).toLocaleString('vi-VN', {
      day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit',
    });
  }
})();
