// result.js - Trang ket qua qua backend API

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function requireStudent() {
  const u = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const t = ApiClient.getToken();
  if (!u || !t) {
    window.location.href = './login.html';
    return null;
  }
  document.getElementById('headerUser').textContent = u.username || '';
  return u;
}

async function renderResult() {
  if (!requireStudent()) return;

  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('id');
  if (!resultId) {
    window.location.href = './index.html';
    return;
  }

  try {
    const data = await ApiClient.request('/results/' + encodeURIComponent(resultId));
    const exam = await ApiClient.request('/exams/' + encodeURIComponent(data.examId));

    document.getElementById('rs-score').textContent = Number(data.score || 0).toFixed(1);
    document.getElementById('rs-meta').textContent = `Đúng: ${data.correct}/${data.total}`;
    document.getElementById('rs-exam').textContent = data.examName || exam.name || '--';
    document.getElementById('rs-duration').textContent = '--';
    document.getElementById('rs-submitted').textContent = 'Đã nộp thành công';

    const pct = ((data.correct / Math.max(1, data.total)) * 100).toFixed(1);
    document.querySelector('.chart').style.background =
      `conic-gradient(#16a34a 0% ${pct}%, #ef4444 ${pct}% 100%)`;

    const ansMap = {};
    (data.answers || []).forEach((a) => {
      ansMap[a.questionId] = a;
    });

    const container = document.getElementById('questions-list');
    container.innerHTML = (exam.questions || []).map((q, idx) => {
      const a = ansMap[q.id] || {};
      const chosenIndex = a.selectedOptionIndex;
      const correctIndex = a.correctOptionIndex;
      const isCorrect = a.isCorrect === true;

      const optionsHtml = (q.options || []).map((opt, i) => {
        let cls = 'option';
        if (i === correctIndex) cls += ' correct';
        else if (i === chosenIndex && !isCorrect) cls += ' wrong-chosen';
        return `<div class="${cls}">
          <span class="opt-letter">${LETTERS[i]}</span>
          <span class="opt-text">${escapeHtml(opt)}</span>
        </div>`;
      }).join('');

      return `<div class="question-card">
        <div class="q-head">
          <div class="q-left">
            <p class="q-number">CÂU ${idx + 1}</p>
            <p class="q-text">${escapeHtml(q.text || '')}</p>
          </div>
          <span class="q-badge ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? 'Đúng' : 'Sai'}</span>
        </div>
        <div class="options">${optionsHtml}</div>
        <div class="explain"><span class="bulb">\uD83D\uDCA1</span><p>${escapeHtml(a.explanation || '')}</p></div>
      </div>`;
    }).join('');
  } catch (err) {
    alert('Không tải được kết quả: ' + (err.message || err));
    window.location.href = './index.html';
  }
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

renderResult();


