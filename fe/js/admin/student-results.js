/**
 * student-results.js - Admin student results via backend API.
 * Depends on: AuthService, ApiClient
 */
(function () {
  AuthService.guardAdminPage();

  var admin = AuthService.getCurrentAdmin();
  document.getElementById('adminUsername').textContent = '\uD83D\uDC64 ' + admin.username;
  document.getElementById('btnLogout').addEventListener('click', function () { AuthService.logoutAdmin(); });
  document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  });

  var currentRows = [];

  init().catch(function (err) {
    alert('Khong tai duoc du lieu ket qua: ' + (err.message || err));
  });

  async function init() {
    await loadExamFilter();

    document.getElementById('filterUsername').addEventListener('input', renderTable);
    document.getElementById('filterExam').addEventListener('change', renderTable);
    document.getElementById('btnClearFilter').addEventListener('click', function () {
      document.getElementById('filterUsername').value = '';
      document.getElementById('filterExam').value = '';
      renderTable();
    });

    renderTable();
  }

  async function loadExamFilter() {
    var data = await ApiClient.request('/admin/exams?page=0&size=200');
    var exams = data.content || [];
    document.getElementById('filterExam').innerHTML = '<option value="">Tat ca</option>' +
      exams.map(function (e) {
        return '<option value="' + e.id + '">' + escHtml(e.name) + '</option>';
      }).join('');
  }

  async function renderTable() {
    var keyword = document.getElementById('filterUsername').value.trim();
    var examId = document.getElementById('filterExam').value;

    var tbody = document.getElementById('resultsTbody');
    try {
      var query = '?page=0&size=200'
        + (keyword ? '&keyword=' + encodeURIComponent(keyword) : '')
        + (examId ? '&examId=' + encodeURIComponent(examId) : '');
      var res = await ApiClient.request('/admin/results' + query);
      currentRows = (res.content || []).slice().sort(function (a, b) {
        return new Date(b.submittedAt || b.submittedat) - new Date(a.submittedAt || a.submittedat);
      });
      document.getElementById('resultCount').textContent = currentRows.length;

      if (!currentRows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-sec" style="padding:20px">Khong tim thay ket qua.</td></tr>';
        return;
      }

      tbody.innerHTML = currentRows.map(function (r) {
        var cls = Number(r.score || 0) >= 8 ? 'text-success' : Number(r.score || 0) >= 5 ? '' : 'text-danger';
        var dSec = Number(r.durationSeconds || r.durationseconds || 0);
        var dMin = Math.floor(dSec / 60);
        var remSec = dSec % 60;

        return '<tr>' +
          '<td>' + escHtml(r.username || '') + '</td>' +
          '<td>' + escHtml(r.examName || '') + '</td>' +
          '<td><strong class="' + cls + '">' + Number(r.score || 0).toFixed(1) + '</strong></td>' +
          '<td>' + (r.correct || 0) + '/' + (r.total || 0) + '</td>' +
          '<td>' + dMin + 'm ' + remSec + 's</td>' +
          '<td>' + formatDateTime(r.submittedAt || r.submittedat) + '</td>' +
          '<td><button class="btn btn--ghost btn--sm" onclick="exportStudentPDF(\'' + escHtml(r.userId || r.userid || '') + '\')">📄 PDF</button></td>' +
        '</tr>';
      }).join('');
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-sec" style="padding:20px">Loi tai du lieu: ' + escHtml(err.message || String(err)) + '</td></tr>';
    }
  }

  window.exportStudentPDF = async function (studentId) {
    if (!studentId) {
      alert('Khong tim thay studentId de export.');
      return;
    }

    try {
      var blob = await ApiClient.request('/admin/students/' + encodeURIComponent(studentId) + '/results/export?format=pdf');
      downloadBlob(blob, 'student-' + studentId + '-results.pdf');
    } catch (err) {
      alert('Export that bai: ' + (err.message || err));
    }
  };

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();

