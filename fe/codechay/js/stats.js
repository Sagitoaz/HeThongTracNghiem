// stats.js - thong ke admin qua backend API

let examMap = [];

function requireAdmin() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || u.role !== 'admin' || !t) {
    window.location.href = './login.html';
    return null;
  }
  return u;
}

async function loadExamOptions() {
  const data = await ApiClient.request('/admin/exams?page=0&size=200');
  examMap = data.content || [];
  $('#filterExam').innerHTML = `
    <option value="all">Tất cả</option>
    ${examMap.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}
  `;
}

async function applyFilter() {
  const examId = $('#filterExam').value;

  const overview = await ApiClient.request('/admin/statistics/overview');
  $('#kpiAttempts').textContent = overview.totalAttempts || 0;
  $('#kpiAvg').textContent = Number(overview.averageScore || 0).toFixed(2);
  $('#kpiDone').textContent = '-';

  if (examId === 'all') {
    $('#rows').innerHTML = '<tr><td colspan="5">Chọn một đề thi để xem thống kê chi tiết.</td></tr>';
    drawHistogram($('#chart'), []);
    return [];
  }

  const stats = await ApiClient.request('/admin/statistics/exams/' + encodeURIComponent(examId));
  $('#kpiAttempts').textContent = stats.attempts || 0;
  $('#kpiAvg').textContent = Number(stats.averageScore || 0).toFixed(2);
  $('#kpiDone').textContent = '-';

  const dist = stats.scoreDistribution || [0, 0, 0, 0, 0];
  const scoreList = [];
  for (let i = 0; i < dist.length; i++) {
    for (let j = 0; j < dist[i]; j++) {
      scoreList.push(i * 2 + 1);
    }
  }
  drawHistogram($('#chart'), scoreList);

  const ex = examMap.find((x) => x.id === examId);
  $('#rows').innerHTML = `
    <tr>
      <td>-</td>
      <td>${escapeHtml(ex?.name || examId)}</td>
      <td>-</td>
      <td>-</td>
      <td><b>${Number(stats.averageScore || 0).toFixed(2)}</b></td>
    </tr>
  `;

  return [];
}

$('#filterExam').addEventListener('change', () => { applyFilter().catch(showErr); });
$('#fromDate').addEventListener('change', () => { applyFilter().catch(showErr); });
$('#toDate').addEventListener('change', () => { applyFilter().catch(showErr); });

$('#btnXlsx').addEventListener('click', async () => {
  const examId = $('#filterExam').value;
  if (examId === 'all') {
    alert('Hãy chọn một đề thi để xuất Excel.');
    return;
  }
  try {
    const blob = await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/results/export?format=xlsx`);
    downloadBlob(blob, `exam-${examId}-results.xlsx`);
  } catch (err) {
    showErr(err);
  }
});

$('#btnPdf').addEventListener('click', async () => {
  const examId = $('#filterExam').value;
  if (examId === 'all') {
    alert('Hãy chọn một đề thi để xuất PDF.');
    return;
  }
  try {
    const blob = await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/results/export?format=pdf`);
    downloadBlob(blob, `exam-${examId}-results.pdf`);
  } catch (err) {
    showErr(err);
  }
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function showErr(err) {
  alert('Không tải được thống kê: ' + (err.message || err));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function init() {
  if (!requireAdmin()) return;
  await loadExamOptions();
  await applyFilter();
}

document.querySelector('.logout-btn').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

init().catch(showErr);

