/**
 * exam-editor.js - Admin exam/question management via backend API.
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

  var examsCache = [];
  var selectedExamId = null;
  var editingExamId = null;
  var editingQuestionId = null;
  var deleteCallback = null;

  init().catch(function (err) {
    alert('Không tải được dữ liệu quản trị: ' + (err.message || err));
  });

  async function init() {
    await loadExams();
    bindEvents();
  }

  function bindEvents() {
    document.getElementById('btnAddExam').addEventListener('click', function () { openExamModal(null); });
    document.getElementById('closeExamModal').addEventListener('click', closeExamModal);
    document.getElementById('cancelExamModal').addEventListener('click', closeExamModal);
    document.getElementById('fExamType').addEventListener('change', function () { toggleStartTime(this.value === 'scheduled'); });

    document.getElementById('saveExamBtn').addEventListener('click', saveExam);

    document.getElementById('btnAddQuestion').addEventListener('click', function () { openQModal(null); });
    document.getElementById('closeQModal').addEventListener('click', closeQModal);
    document.getElementById('cancelQModal').addEventListener('click', closeQModal);
    document.getElementById('saveQBtn').addEventListener('click', saveQuestion);

    document.getElementById('btnImportExcel').addEventListener('click', function () {
      document.getElementById('importSection').classList.toggle('hidden');
    });

    var importZone = document.getElementById('importZone');
    var fileInput = document.getElementById('excelInput');

    importZone.addEventListener('click', function () { fileInput.click(); });
    importZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      importZone.classList.add('import-zone--active');
    });
    importZone.addEventListener('dragleave', function () {
      importZone.classList.remove('import-zone--active');
    });
    importZone.addEventListener('drop', function (e) {
      e.preventDefault();
      importZone.classList.remove('import-zone--active');
      if (e.dataTransfer.files[0]) processImport(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function () {
      if (this.files[0]) processImport(this.files[0]);
      this.value = '';
    });

    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDelete').addEventListener('click', function () {
      if (deleteCallback) deleteCallback();
      closeDeleteModal();
    });
  }

  async function loadExams() {
    var data = await ApiClient.request('/admin/exams?page=0&size=200');
    examsCache = data.content || [];
    renderExamTable();
  }

  function renderExamTable() {
    var tbody = document.getElementById('examTbody');
    if (!examsCache.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-sec" style="padding:20px">Chưa có đề thi nào.</td></tr>';
      return;
    }

    tbody.innerHTML = examsCache.map(function (e) {
      var typeLabel = e.type === 'free'
        ? '<span class="badge badge--success">Tự do</span>'
        : '<span class="badge badge--warning">Có lịch</span>';
      var activeClass = e.id === selectedExamId ? 'style="background:#fef3f3"' : '';
      return '<tr ' + activeClass + '>' +
        '<td><strong>' + escHtml(e.name) + '</strong></td>' +
        '<td>' + typeLabel + '</td>' +
        '<td>' + (e.durationMinutes || 0) + ' phút</td>' +
        '<td>' + (e.questionCount || 0) + ' câu</td>' +
        '<td>-</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn--secondary btn--sm" onclick="editExam(\'' + e.id + '\')" style="margin-right:4px">Sửa</button>' +
          '<button class="btn btn--secondary btn--sm" onclick="openQuestions(\'' + e.id + '\')" style="margin-right:4px">Câu hỏi</button>' +
          '<button class="btn btn--danger btn--sm" onclick="deleteExamConfirm(\'' + e.id + '\')">Xóa</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function findExam(examId) {
    return examsCache.find(function (x) { return x.id === examId; }) || null;
  }

  function openExamModal(examId) {
    editingExamId = examId || null;
    document.getElementById('examModalTitle').textContent = examId ? 'Sửa đề thi' : 'Thêm đề thi';
    document.getElementById('fExamNameErr').textContent = '';
    document.getElementById('fExamDurationErr').textContent = '';

    if (examId) {
      var e = findExam(examId);
      document.getElementById('fExamName').value = e.name || '';
      document.getElementById('fExamDesc').value = e.description || '';
      document.getElementById('fExamType').value = e.type || 'free';
      document.getElementById('fExamDuration').value = e.durationMinutes || 30;
      document.getElementById('fExamStartTime').value = e.startTime ? new Date(e.startTime).toISOString().slice(0, 16) : '';
      toggleStartTime((e.type || 'free') === 'scheduled');
    } else {
      document.getElementById('fExamName').value = '';
      document.getElementById('fExamDesc').value = '';
      document.getElementById('fExamType').value = 'free';
      document.getElementById('fExamDuration').value = '30';
      document.getElementById('fExamStartTime').value = '';
      toggleStartTime(false);
    }

    document.getElementById('examModal').classList.remove('hidden');
  }

  function closeExamModal() {
    document.getElementById('examModal').classList.add('hidden');
  }

  function toggleStartTime(show) {
    document.getElementById('startTimeGroup').classList[show ? 'remove' : 'add']('hidden');
  }

  async function saveExam() {
    var name = document.getElementById('fExamName').value.trim();
    var desc = document.getElementById('fExamDesc').value.trim();
    var type = document.getElementById('fExamType').value;
    var duration = parseInt(document.getElementById('fExamDuration').value, 10);
    var startTime = document.getElementById('fExamStartTime').value;

    var valid = true;
    if (!name) {
      valid = false;
      document.getElementById('fExamNameErr').textContent = 'Vui lòng nhập tên đề thi.';
    } else {
      document.getElementById('fExamNameErr').textContent = '';
    }

    if (!duration || duration < 1) {
      valid = false;
      document.getElementById('fExamDurationErr').textContent = 'Thời gian phải >= 1 phút.';
    } else {
      document.getElementById('fExamDurationErr').textContent = '';
    }

    if (!valid) return;

    var payload = {
      name: name,
      description: desc,
      type: type,
      durationMinutes: duration,
      startTime: (type === 'scheduled' && startTime) ? new Date(startTime).toISOString() : null,
    };

    try {
      if (editingExamId) {
        await ApiClient.request('/admin/exams/' + encodeURIComponent(editingExamId), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await ApiClient.request('/admin/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      closeExamModal();
      await loadExams();
      if (selectedExamId) await openQuestions(selectedExamId);
    } catch (err) {
      alert('Không lưu được đề thi: ' + (err.message || err));
    }
  }

  async function openQuestions(examId) {
    selectedExamId = examId;
    var exam = findExam(examId);
    document.getElementById('qPanelTitle').textContent = 'Câu hỏi - ' + exam.name;
    document.getElementById('questionPanel').classList.remove('hidden');
    document.getElementById('importSection').classList.add('hidden');
    renderExamTable();
    document.getElementById('questionPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      var questions = await ApiClient.request('/admin/exams/' + encodeURIComponent(examId) + '/questions');
      renderQuestionList(questions || []);
      if (!questions || questions.length === 0) {
        setTimeout(function () {
          openQModal(null);
        }, 150);
      }
    } catch (err) {
      alert('Không tải được câu hỏi: ' + (err.message || err));
    }
  }

  function renderQuestionList(qs) {
    var list = document.getElementById('questionList');
    if (!qs.length) {
      list.innerHTML = '<div class="empty-state" style="padding:32px"><div class="empty-state__icon">\uD83D\uDCAD</div>' +
        '<div class="empty-state__title">Chưa có câu hỏi</div>' +
        '<div class="empty-state__desc">Thêm câu hỏi mới hoặc nhập từ tệp Excel.</div></div>';
      return;
    }

    list.innerHTML = qs.map(function (q, i) {
      return '<div class="question-item">' +
        '<span class="question-item__number">' + (i + 1) + '.</span>' +
        '<span class="question-item__text">' + escHtml(q.text) + '</span>' +
        '<div class="question-item__actions">' +
          '<button class="btn btn--ghost btn--sm" onclick="editQuestion(\'' + q.id + '\')">Sửa</button>' +
          '<button class="btn btn--danger btn--sm" onclick="deleteQuestionConfirm(\'' + q.id + '\')">Xóa</button>' +
        '</div>' +
      '</div>';
    }).join('');

    window.__questionsCache = qs;
  }

  function openQModal(questionId) {
    editingQuestionId = questionId || null;
    document.getElementById('qModalTitle').textContent = editingQuestionId ? 'Sửa câu hỏi' : 'Thêm câu hỏi';
    document.getElementById('fQTextErr').textContent = '';

    var q = null;
    if (editingQuestionId) {
      q = (window.__questionsCache || []).find(function (x) { return x.id === editingQuestionId; }) || null;
    }

    document.getElementById('fQText').value = q ? q.text : '';
    document.getElementById('fQExplain').value = q ? (q.explanation || '') : '';

    var opts = q ? q.options : ['', '', '', ''];
    var correctIdx = q ? q.correctOptionIndex : 0;
    var labels = ['A', 'B', 'C', 'D'];

    document.getElementById('optionsEditor').innerHTML = opts.map(function (opt, i) {
      return '<div class="option-row">' +
        '<input type="radio" name="correctOpt" value="' + i + '"' + (i === correctIdx ? ' checked' : '') + ' />' +
        '<input class="form-input opt-input" type="text" placeholder="Dap an ' + labels[i] + '" value="' + escHtml(opt || '') + '" />' +
      '</div>';
    }).join('');

    document.getElementById('questionModal').classList.remove('hidden');
  }

  function closeQModal() {
    document.getElementById('questionModal').classList.add('hidden');
  }

  async function saveQuestion() {
    var text = document.getElementById('fQText').value.trim();
    var explain = document.getElementById('fQExplain').value.trim();
    var optInputs = document.querySelectorAll('.opt-input');
    var correctRadio = document.querySelector('input[name=correctOpt]:checked');

    if (!text) {
      document.getElementById('fQTextErr').textContent = 'Vui lòng nhập câu hỏi.';
      return;
    }
    document.getElementById('fQTextErr').textContent = '';

    var options = Array.from(optInputs).map(function (el) { return el.value.trim(); });
    var correct = correctRadio ? parseInt(correctRadio.value, 10) : 0;

    var payload = {
      text: text,
      options: options,
      correctOptionIndex: correct,
      explanation: explain,
    };

    try {
      if (editingQuestionId) {
        await ApiClient.request('/admin/exams/' + encodeURIComponent(selectedExamId) + '/questions/' + encodeURIComponent(editingQuestionId), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await ApiClient.request('/admin/exams/' + encodeURIComponent(selectedExamId) + '/questions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      closeQModal();
      await openQuestions(selectedExamId);
      await loadExams();
    } catch (err) {
      alert('Không lưu được câu hỏi: ' + (err.message || err));
    }
  }

  async function processImport(file) {
    if (!selectedExamId) {
      alert('Hãy chọn đề thi trước khi import.');
      return;
    }

    var resultDiv = document.getElementById('importResult');
    resultDiv.innerHTML = '<div class="alert alert--info" style="margin-bottom:8px">Đang nhập dữ liệu...</div>';

    try {
      var form = new FormData();
      form.append('file', file);
      var result = await ApiClient.request('/admin/exams/' + encodeURIComponent(selectedExamId) + '/questions/import', {
        method: 'POST',
        body: form,
        headers: {},
      });

      resultDiv.innerHTML = '<div class="alert alert--success">Import thành công: ' +
        (result.importedCount || 0) + ' câu. Lỗi: ' + (result.failedCount || 0) + '</div>';
      await openQuestions(selectedExamId);
      await loadExams();
    } catch (err) {
      resultDiv.innerHTML = '<div class="alert alert--error">Import thất bại: ' + escHtml(err.message || String(err)) + '</div>';
    }
  }

  function openDeleteModal(msg, cb) {
    document.getElementById('deleteModalMsg').textContent = msg;
    deleteCallback = cb;
    document.getElementById('deleteModal').classList.remove('hidden');
  }

  function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteCallback = null;
  }

  window.editExam = function (id) { openExamModal(id); };
  window.openQuestions = function (id) { openQuestions(id); };

  window.deleteExamConfirm = function (id) {
    var exam = findExam(id);
    openDeleteModal('Bạn có chắc muốn xóa đề thi "' + (exam ? exam.name : id) + '"?', async function () {
      try {
        await ApiClient.request('/admin/exams/' + encodeURIComponent(id), { method: 'DELETE', body: null, headers: {} });
        if (selectedExamId === id) {
          selectedExamId = null;
          document.getElementById('questionPanel').classList.add('hidden');
        }
        await loadExams();
      } catch (err) {
        alert('Không xóa được đề thi: ' + (err.message || err));
      }
    });
  };

  window.editQuestion = function (questionId) { openQModal(questionId); };
  window.deleteQuestionConfirm = function (questionId) {
    openDeleteModal('Bạn có chắc muốn xóa câu hỏi này?', async function () {
      try {
        await ApiClient.request('/admin/exams/' + encodeURIComponent(selectedExamId) + '/questions/' + encodeURIComponent(questionId), {
          method: 'DELETE', body: null, headers: {},
        });
        await openQuestions(selectedExamId);
        await loadExams();
      } catch (err) {
        alert('Không xóa được câu hỏi: ' + (err.message || err));
      }
    });
  };

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();




