/**
 * statistics.js - Admin statistics via backend API.
 * Depends on: AuthService, ApiClient, Chart.js
 */
(function () {
  AuthService.guardAdminPage();

  var admin = AuthService.getCurrentAdmin();
  document.getElementById('adminUsername').textContent = '\uD83D\uDC64 ' + admin.username;
  document.getElementById('btnLogout').addEventListener('click', function () { AuthService.logoutAdmin(); });
  document.getElementById('sidebarToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('sidebar--open');
  });

  var doughnutChart = null;
  var barChart = null;
  var exams = [];

  init().catch(function (err) {
    alert('Khong tai duoc thong ke: ' + (err.message || err));
  });

  async function init() {
    await renderOverall();
    await loadExamOptions();

    var select = document.getElementById('filterExam');
    select.addEventListener('change', async function () {
      if (!this.value) {
        document.getElementById('examStats').classList.add('hidden');
        document.getElementById('noExamMsg').classList.remove('hidden');
        document.getElementById('btnExportPDF').disabled = true;
        return;
      }
      try {
        await renderExamStats(this.value);
        document.getElementById('btnExportPDF').disabled = false;
      } catch (err) {
        document.getElementById('examStats').classList.remove('hidden');
        document.getElementById('noExamMsg').classList.add('hidden');
        document.getElementById('statsTbody').innerHTML =
          '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Loi tai thong ke: ' + escHtml(err.message || String(err)) + '</td></tr>';
      }
    });

    document.getElementById('btnExportPDF').addEventListener('click', async function () {
      var examId = select.value;
      if (!examId) return;
      try {
        var blob = await ApiClient.request('/admin/exams/' + encodeURIComponent(examId) + '/results/export?format=pdf');
        downloadBlob(blob, 'exam-' + examId + '-results.pdf');
      } catch (err) {
        alert('Export that bai: ' + (err.message || err));
      }
    });

    if (exams.length) {
      select.value = exams[0].id;
      await renderExamStats(exams[0].id);
      document.getElementById('btnExportPDF').disabled = false;
    }
  }

  async function renderOverall() {
    var overview = await ApiClient.request('/admin/statistics/overview');
    var items = [
      { icon: '\uD83D\uDC65', label: 'Sinh vien', value: overview.totalStudents || 0 },
      { icon: '\uD83D\uDC65', label: 'De thi', value: overview.totalExams || 0 },
      { icon: '\uD83D\uDC65', label: 'Luot nop', value: overview.totalAttempts || 0 },
      { icon: '\u2B50', label: 'Diem TB', value: Number(overview.averageScore || 0).toFixed(1) + '/10' },
    ];

    document.getElementById('overallStats').innerHTML = items.map(function (s) {
      return '<div class="admin-stat">' +
        '<div class="admin-stat__icon">' + s.icon + '</div>' +
        '<div class="admin-stat__value">' + s.value + '</div>' +
        '<div class="admin-stat__label">' + s.label + '</div>' +
      '</div>';
    }).join('');
  }

  async function loadExamOptions() {
    var data = await ApiClient.request('/admin/exams?page=0&size=200');
    exams = data.content || [];
    var select = document.getElementById('filterExam');
    select.innerHTML = '<option value="">-- Chon de thi --</option>' +
      exams.map(function (e) {
        return '<option value="' + e.id + '">' + escHtml(e.name) + '</option>';
      }).join('');
  }

  async function renderExamStats(examId) {
    var stats = await ApiClient.request('/admin/statistics/exams/' + encodeURIComponent(examId));
    var resultsRes = await ApiClient.request('/admin/exams/' + encodeURIComponent(examId) + '/results?page=0&size=200');
    var results = resultsRes.content || [];

    document.getElementById('examStats').classList.remove('hidden');
    document.getElementById('noExamMsg').classList.add('hidden');

    var cards = [
      { icon: '\uD83D\uDC65', label: 'Luot nop', value: stats.attempts || 0 },
      { icon: '\u2B50', label: 'Diem TB', value: Number(stats.averageScore || 0).toFixed(1) + '/10' },
    ];

    document.getElementById('examStatCards').innerHTML = cards.map(function (c) {
      return '<div class="admin-stat">' +
        '<div class="admin-stat__icon">' + c.icon + '</div>' +
        '<div class="admin-stat__value">' + c.value + '</div>' +
        '<div class="admin-stat__label">' + c.label + '</div>' +
      '</div>';
    }).join('');

    var dist = stats.scoreDistribution || [0, 0, 0, 0, 0];
    var totalAttempts = Number(stats.attempts || 0);
    var totalCorrectApprox = dist[3] + dist[4];
    var totalWrongApprox = Math.max(0, totalAttempts - totalCorrectApprox);

    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(document.getElementById('doughnutChart'), {
      type: 'doughnut',
      data: {
        labels: ['Diem cao (6-10)', 'Diem thap (0-6)'],
        datasets: [{
          data: [totalCorrectApprox, totalWrongApprox],
          backgroundColor: ['#28A745', '#DC3545'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '60%' },
    });

    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
        datasets: [{
          label: 'So sinh vien',
          data: dist,
          backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#28A745'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });

    var tbody = document.getElementById('statsTbody');
    if (!results.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Chua co ket qua nao cho de thi nay.</td></tr>';
    } else {
      tbody.innerHTML = results.map(function (r) {
        var cls = Number(r.score || 0) >= 8 ? 'text-success' : Number(r.score || 0) >= 5 ? '' : 'text-danger';
        var dSec = Number(r.durationSeconds || r.durationseconds || 0);
        var dMin = Math.floor(dSec / 60);
        var remSec = dSec % 60;
        return '<tr>' +
          '<td>' + escHtml(r.username || '') + '</td>' +
          '<td><strong class="' + cls + '">' + Number(r.score || 0).toFixed(1) + '</strong></td>' +
          '<td>' + Number(r.correct || 0) + '/' + Number(r.total || 0) + '</td>' +
          '<td>' + dMin + 'm ' + remSec + 's</td>' +
          '<td>' + formatDateTime(r.submittedAt || r.submittedat) + '</td>' +
          '</tr>';
      }).join('');
    }
  }

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

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

