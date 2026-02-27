/**
 * statistics.js — Admin statistics page controller
 * Depends on: DataService, AuthService, StatisticsService, ExportService, Chart.js
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

  var doughnutChart = null;
  var barChart      = null;

  // ─── Overall stats ────────────────────────────────────

  var overall = StatisticsService.getOverallStats();
  var statsGrid = document.getElementById('overallStats');
  var oItems = [
    { icon: '👥', label: 'Sinh viên', value: overall.totalUsers },
    { icon: '📝', label: 'Đề thi',    value: overall.totalExams },
    { icon: '📋', label: 'Lượt nộp',  value: overall.totalAttempts },
    { icon: '⭐', label: 'Điểm TB',   value: overall.averageScore + '/10' },
  ];
  statsGrid.innerHTML = oItems.map(function (s) {
    return '<div class="admin-stat">' +
      '<div class="admin-stat__icon">' + s.icon + '</div>' +
      '<div class="admin-stat__value">' + s.value + '</div>' +
      '<div class="admin-stat__label">' + s.label + '</div>' +
      '</div>';
  }).join('');

  // ─── Exam filter ──────────────────────────────────────

  var exams = DataService.getExams();
  var select = document.getElementById('filterExam');
  select.innerHTML = '<option value="">-- Chọn đề thi --</option>' +
    exams.map(function (e) {
      return '<option value="' + e.id + '">' + escHtml(e.name) + '</option>';
    }).join('');

  select.addEventListener('change', function () {
    if (!this.value) {
      document.getElementById('examStats').classList.add('hidden');
      document.getElementById('noExamMsg').classList.remove('hidden');
      document.getElementById('btnExportPDF').disabled = true;
      return;
    }
    renderExamStats(this.value);
    document.getElementById('btnExportPDF').disabled = false;
  });

  // Auto-select first exam if exists
  if (exams.length > 0) {
    select.value = exams[0].id;
    select.dispatchEvent(new Event('change'));
  }

  // ─── Export PDF ──────────────────────────────────────

  document.getElementById('btnExportPDF').addEventListener('click', function () {
    var examId = select.value;
    if (!examId) return;
    var stats = StatisticsService.getStatsByExam(examId);
    ExportService.exportStatsPDF(stats);
  });

  // ─── Render exam stats ─────────────────────────────────

  function renderExamStats(examId) {
    var stats = StatisticsService.getStatsByExam(examId);
    if (!stats) return;

    document.getElementById('examStats').classList.remove('hidden');
    document.getElementById('noExamMsg').classList.add('hidden');

    // Stat cards
    var cards = [
      { icon: '📋', label: 'Lượt nộp', value: stats.attempts },
      { icon: '⭐', label: 'Điểm TB',  value: stats.averageScore + '/10' },
    ];
    document.getElementById('examStatCards').innerHTML = cards.map(function (c) {
      return '<div class="admin-stat">' +
        '<div class="admin-stat__icon">' + c.icon + '</div>' +
        '<div class="admin-stat__value">' + c.value + '</div>' +
        '<div class="admin-stat__label">' + c.label + '</div>' +
        '</div>';
    }).join('');

    // Doughnut chart
    var totalCorrect = stats.results.reduce(function (s, r) { return s + r.correct; }, 0);
    var totalQ = stats.results.reduce(function (s, r) { return s + r.total; }, 0);
    var totalWrong = totalQ - totalCorrect;

    if (doughnutChart) doughnutChart.destroy();
    var dCtx = document.getElementById('doughnutChart');
    doughnutChart = new Chart(dCtx, {
      type: 'doughnut',
      data: {
        labels: ['Đúng', 'Sai'],
        datasets: [{
          data: [totalCorrect, totalWrong],
          backgroundColor: ['#28A745', '#DC3545'],
          borderWidth: 2, borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%',
      },
    });

    // Bar chart
    if (barChart) barChart.destroy();
    var bCtx = document.getElementById('barChart');
    var dist  = stats.scoreDistribution;
    barChart = new Chart(bCtx, {
      type: 'bar',
      data: {
        labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
        datasets: [{
          label: 'Số sinh viên',
          data: dist,
          backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#28A745'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });

    // Results table
    var tbody = document.getElementById('statsTbody');
    if (stats.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-sec" style="padding:20px">Chưa có kết quả.</td></tr>';
    } else {
      var sorted = stats.results.slice().sort(function (a, b) { return b.score - a.score; });
      tbody.innerHTML = sorted.map(function (r) {
        var cls = r.score >= 8 ? 'text-success' : r.score >= 5 ? '' : 'text-danger';
        var dMin = Math.floor(r.duration / 60);
        var dSec = r.duration % 60;
        return '<tr>' +
          '<td>' + escHtml(r.username) + '</td>' +
          '<td><strong class="' + cls + '">' + r.score.toFixed(1) + '</strong></td>' +
          '<td>' + r.correct + '/' + r.total + '</td>' +
          '<td>' + dMin + 'm ' + dSec + 's</td>' +
          '<td>' + formatDateTime(r.submittedAt) + '</td>' +
          '</tr>';
      }).join('');
    }
  }

  // ─── Utils ────────────────────────────────────────────

  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function formatDateTime(iso) {
    return new Date(iso).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
})();
