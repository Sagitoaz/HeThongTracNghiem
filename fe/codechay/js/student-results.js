// student-results.js - ket qua sinh vien qua backend API

function requireAdmin() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || u.role !== 'admin' || !t) {
    window.location.href = './login.html';
    return null;
  }
  return u;
}

function scoreBadge(score) {
  const cls = score >= 8 ? 'good' : score >= 5 ? 'mid' : 'bad';
  return `<span class="score ${cls}">${Number(score || 0).toFixed(1)}</span>`;
}

function renderTable(data) {
  const tbody = document.getElementById('results-tbody');
  document.getElementById('result-count').textContent = `Danh sách kết quả (${data.length})`;

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:24px">Không có kết quả nào.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((r) => `<tr>
    <td>${escapeHtml(r.username || '')}</td>
    <td>${escapeHtml(r.examName || '')}</td>
    <td>${scoreBadge(r.score)}</td>
    <td>${r.correct || 0}/${r.total || 0}</td>
    <td>${Math.floor((r.durationSeconds || 0) / 60)}m ${(r.durationSeconds || 0) % 60}s</td>
    <td>${new Date(r.submittedAt).toLocaleString('vi-VN')}</td>
    <td class="col-action"><button class="btn btn-soft" data-student="${r.userId}">PDF</button></td>
  </tr>`).join('');

  tbody._data = data;
}

async function applyFilter() {
  const studentId = document.getElementById('username').value.trim();
  const examId = document.getElementById('exam').value;

  if (!studentId) {
    renderTable([]);
    return;
  }

  try {
    const q = '?page=0&size=200' + (examId && examId !== 'Tất cả' ? '&examId=' + encodeURIComponent(examId) : '');
    const res = await ApiClient.request('/admin/students/' + encodeURIComponent(studentId) + '/results' + q);
    renderTable(res.content || []);
  } catch (err) {
    alert('Không tải được kết quả: ' + (err.message || err));
    renderTable([]);
  }
}

async function loadExamOptions() {
  const data = await ApiClient.request('/admin/exams?page=0&size=200');
  const exams = data.content || [];
  const sel = document.getElementById('exam');
  sel.innerHTML = '<option>Tất cả</option>' + exams.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('');
}

document.getElementById('username').addEventListener('input', applyFilter);
document.getElementById('exam').addEventListener('change', applyFilter);
document.querySelector('.btn-delete').addEventListener('click', () => {
  document.getElementById('username').value = '';
  document.getElementById('exam').selectedIndex = 0;
  applyFilter();
});

document.getElementById('results-tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-student]');
  if (!btn) return;

  try {
    const studentId = btn.dataset.student;
    const blob = await ApiClient.request('/admin/students/' + encodeURIComponent(studentId) + '/results/export?format=pdf');
    downloadBlob(blob, `student-${studentId}-results.pdf`);
  } catch (err) {
    alert('Xuất dữ liệu thất bại: ' + (err.message || err));
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.querySelector('.logout-btn').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

async function init() {
  if (!requireAdmin()) return;
  await loadExamOptions();
  await applyFilter();
}

init();

