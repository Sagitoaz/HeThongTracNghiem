// exam-editor.js - Admin tao/sua de thi qua backend API

let examId = getQueryParam('examId');
let questionCache = [];
let editingQId = null;

function requireAdmin() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || u.role !== 'admin' || !t) {
    window.location.href = './login.html';
    return null;
  }
  return u;
}

async function findExam() {
  if (!examId) return null;
  const data = await ApiClient.request('/admin/exams?page=0&size=200');
  const exams = data.content || [];
  return exams.find((e) => e.id === examId) || null;
}

function setExamForm(exam) {
  $('#pageTitle').textContent = exam ? `Chỉnh sửa kỳ thi (${exam.id})` : 'Tạo kỳ thi';
  $('#examName').value = exam?.name || '';
  $('#examDesc').value = exam?.description || '';
  $('#examType').value = exam?.type || 'free';
  $('#examDuration').value = exam?.durationMinutes ?? '';
}

async function loadQuestions() {
  if (!examId) {
    renderQuestions([]);
    return;
  }
  questionCache = await ApiClient.request('/admin/exams/' + encodeURIComponent(examId) + '/questions');
  renderQuestions(questionCache || []);
}

async function loadPage() {
  if (!requireAdmin()) return;

  const exam = await findExam();
  setExamForm(exam);
  await loadQuestions();
  clearQForm();
}

async function saveExam() {
  const name = $('#examName').value.trim();
  if (!name) {
    alert('Tên kỳ thi không được để trống');
    return;
  }

  const payload = {
    name,
    description: $('#examDesc').value.trim(),
    type: $('#examType').value,
    durationMinutes: Number($('#examDuration').value || 0),
    startTime: null,
  };

  if (payload.type === 'scheduled' && !payload.durationMinutes) {
    alert('Kỳ thi có lịch cần durationMinutes > 0');
    return;
  }

  try {
    if (!examId) {
      const created = await ApiClient.request('/admin/exams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      examId = created.id;
      history.replaceState({}, '', './exam-editor.html?examId=' + examId);
    } else {
      await ApiClient.request('/admin/exams/' + encodeURIComponent(examId), {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    }

    const exam = await findExam();
    setExamForm(exam);
    alert('Đã lưu kỳ thi');
  } catch (err) {
    alert('Không lưu được kỳ thi: ' + (err.message || err));
  }
}

function renderQuestions(questions) {
  $('#qRows').innerHTML = questions.map((q, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(q.text || '')}</td>
      <td><b>${'ABCD'[q.correctOptionIndex] || 'A'}</b></td>
      <td class="row">
        <button class="btn btn-sm btn-ghost" data-edit-q="${q.id}">Sửa</button>
        <button class="btn btn-sm btn-danger" data-del-q="${q.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
}

function clearQForm() {
  editingQId = null;
  $('#qText').value = '';
  $('#optA').value = '';
  $('#optB').value = '';
  $('#optC').value = '';
  $('#optD').value = '';
  $('#qCorrect').value = '0';
  $('#qHint').textContent = 'Đang ở chế độ: thêm câu mới';
}

function loadQToForm(qId) {
  const q = questionCache.find((x) => x.id === qId);
  if (!q) return;

  editingQId = qId;
  $('#qText').value = q.text || '';
  $('#optA').value = q.options?.[0] || '';
  $('#optB').value = q.options?.[1] || '';
  $('#optC').value = q.options?.[2] || '';
  $('#optD').value = q.options?.[3] || '';
  $('#qCorrect').value = String(q.correctOptionIndex || 0);
  $('#qHint').textContent = `Đang sửa câu: ${q.id}`;
}

async function saveQuestion() {
  if (!examId) {
    alert('Bạn cần lưu kỳ thi trước');
    return;
  }

  const text = $('#qText').value.trim();
  if (!text) {
    alert('Câu hỏi không được để trống');
    return;
  }

  const payload = {
    text,
    options: [
      $('#optA').value.trim(),
      $('#optB').value.trim(),
      $('#optC').value.trim(),
      $('#optD').value.trim(),
    ],
    correctOptionIndex: Number($('#qCorrect').value),
    explanation: '',
  };

  try {
    if (editingQId) {
      await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/questions/${encodeURIComponent(editingQId)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/questions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    clearQForm();
    await loadQuestions();
  } catch (err) {
    alert('Không lưu được câu hỏi: ' + (err.message || err));
  }
}

async function importExcel() {
  if (!examId) {
    alert('Bạn cần lưu kỳ thi trước');
    return;
  }

  const file = $('#excelFile').files?.[0];
  if (!file) {
    alert('Chọn tệp Excel');
    return;
  }

  const form = new FormData();
  form.append('file', file);

  try {
    const result = await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/questions/import`, {
      method: 'POST',
      body: form,
      headers: {},
    });
    alert(`Nhập xong: ${result.importedCount || 0} câu, lỗi ${result.failedCount || 0}`);
    await loadQuestions();
  } catch (err) {
    alert('Nhập thất bại: ' + (err.message || err));
  }
}

document.addEventListener('click', async (e) => {
  const editId = e.target?.dataset?.editQ;
  if (editId) loadQToForm(editId);

  const delId = e.target?.dataset?.delQ;
  if (!delId) return;

  if (!confirm('Xác nhận xóa câu hỏi?')) return;

  try {
    await ApiClient.request(`/admin/exams/${encodeURIComponent(examId)}/questions/${encodeURIComponent(delId)}`, {
      method: 'DELETE',
      body: null,
      headers: {},
    });
    await loadQuestions();
  } catch (err) {
    alert('Không xóa được câu hỏi: ' + (err.message || err));
  }
});

$('#btnSaveExam').addEventListener('click', saveExam);
$('#btnNewExam').addEventListener('click', () => {
  examId = null;
  history.replaceState({}, '', './exam-editor.html');
  clearQForm();
  setExamForm(null);
  renderQuestions([]);
});
$('#btnClearQ').addEventListener('click', clearQForm);
$('#btnSaveQ').addEventListener('click', saveQuestion);
$('#btnImportExcel').addEventListener('click', importExcel);

document.querySelector('.logout-btn').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadPage();

