// app.js - danh sach ky thi (codechay/index.html) via backend

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const examList = document.getElementById('examList');
let exams = [];

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

function isExamActive(exam) {
  if (typeof exam.isAvailable === 'boolean') return exam.isAvailable;
  if (exam.type === 'free') return true;
  if (!exam.startTime) return false;
  return new Date() >= new Date(exam.startTime);
}

function renderExam(list) {
  examList.innerHTML = '';
  list.forEach((exam) => {
    const card = document.createElement('div');
    card.className = 'exam-card';

    const h3 = document.createElement('h3');
    h3.textContent = exam.name;

    const p0 = document.createElement('p');
    p0.textContent = String(exam.type || '').toUpperCase();

    const p1 = document.createElement('p');
    const qCount = exam.questionCount || (exam.questions ? exam.questions.length : 0);
    const duration = exam.durationMinutes || exam.duration || 0;
    p1.textContent = '\u23F1 ' + duration + ' phut  \uD83D\uDCDD ' + qCount + ' cau';

    const p2 = document.createElement('p');
    p2.textContent = exam.description || '';

    const buttonJoin = document.createElement('button');
    buttonJoin.id = 'btn';
    buttonJoin.textContent = 'Bat dau thi';

    if (!isExamActive(exam)) buttonJoin.disabled = true;
    buttonJoin.onclick = () => { window.location.href = 'exam.html?id=' + encodeURIComponent(exam.id); };

    card.appendChild(h3);
    card.appendChild(p0);
    card.appendChild(p1);
    card.appendChild(p2);

    if (exam.type === 'scheduled' && exam.startTime) {
      const p3 = document.createElement('p');
      const dateStart = new Date(exam.startTime);
      p3.textContent = 'Bat dau luc: ' + dateStart.toLocaleString('vi-VN');
      card.appendChild(p3);
    }

    card.appendChild(buttonJoin);
    examList.appendChild(card);
  });
}

function applyFilterAndRender() {
  const searchText = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const filtered = exams.filter((exam) => {
    const matchName = (exam.name || '').toLowerCase().includes(searchText);
    const matchType = status === 'all' || status === exam.type;
    return matchName && matchType;
  });
  renderExam(filtered);
}

async function init() {
  if (!requireStudent()) return;
  try {
    const data = await ApiClient.request('/exams?page=0&size=100');
    exams = data.content || [];
    renderExam(exams);
  } catch (err) {
    alert('Khong tai duoc danh sach ky thi: ' + (err.message || err));
  }
}

searchInput.addEventListener('input', applyFilterAndRender);
statusFilter.addEventListener('change', applyFilterAndRender);

document.querySelector('.ptit-logout').addEventListener('click', function (e) {
  e.preventDefault();
  ApiClient.clearAuth();
  window.location.href = './login.html';
});

init();

