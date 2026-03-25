// dashboard.js - Admin dashboard via codechay backend

function requireAdmin() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || u.role !== 'admin' || !t) {
    window.location.href = './login.html';
    return null;
  }
  return u;
}

async function renderDashboard() {
  if (!requireAdmin()) return;

  try {
    const [overview, examsRes] = await Promise.all([
      ApiClient.request('/admin/statistics/overview'),
      ApiClient.request('/admin/exams?page=0&size=200'),
    ]);

    const exams = examsRes.content || [];
    document.getElementById('kpiExams').textContent = overview.totalExams || 0;
    document.getElementById('kpiStudents').textContent = overview.totalStudents || 0;
    document.getElementById('kpiAvg').textContent = Number(overview.averageScore || 0).toFixed(2);

    document.getElementById('examRows').innerHTML = exams.map((e) => `
      <tr>
        <td>${e.id}</td>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(formatExamType(e))}</td>
        <td>-</td>
        <td class="row">
          <a class="btn btn-sm btn-ghost" href="./exam-editor.html?examId=${e.id}">Sửa</a>
          <button class="btn btn-sm btn-danger" data-del-exam="${e.id}">Xóa</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('userRows').innerHTML =
      '<tr><td colspan="4" class="muted">API hiện tại chưa hỗ trợ CRUD người dùng trên bảng điều khiển.</td></tr>';
    document.getElementById('btnSaveUser').disabled = true;
    document.getElementById('btnClearUser').disabled = true;
    document.getElementById('btnNewUser').disabled = true;
    document.getElementById('uName').disabled = true;
    document.getElementById('uEmail').disabled = true;
    document.getElementById('userFormHint').textContent = 'Không hỗ trợ bởi API hiện tại.';
  } catch (err) {
    alert('Không tải được bảng điều khiển: ' + (err.message || err));
  }
}

document.addEventListener('click', async (e) => {
  const delExam = e.target?.dataset?.delExam;
  if (!delExam) return;

  if (!confirm('Xác nhận xóa đề thi?')) return;

  try {
    await ApiClient.request('/admin/exams/' + encodeURIComponent(delExam), {
      method: 'DELETE',
      body: null,
      headers: {},
    });
    await renderDashboard();
  } catch (err) {
    alert('Không xóa được đề thi: ' + (err.message || err));
  }
});

document.querySelector('.logout-btn').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

renderDashboard();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

