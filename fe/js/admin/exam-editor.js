/**
 * exam-editor.js — Admin exam & question management controller
 * Depends on: DataService, AuthService, ImportService
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

  // ─── State ────────────────────────────────────────────

  var selectedExamId = null;
  var editingExamId  = null;   // for exam modal
  var editingQIdx    = null;   // index in questions array, or null for new
  var deleteCallback = null;

  // ─── Render exam list ──────────────────────────────────

  function renderExamTable() {
    var exams = DataService.getExams();
    var tbody = document.getElementById('examTbody');
    if (exams.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-sec" style="padding:20px">Chưa có đề thi nào.</td></tr>';
      return;
    }
    tbody.innerHTML = exams.map(function (e) {
      var typeLabel = e.type === 'free' ? '<span class="badge badge--success">Tự do</span>'
                                        : '<span class="badge badge--warning">Có lịch</span>';
      var qCount = Array.isArray(e.questions) ? e.questions.length : 0;
      var activeClass = e.id === selectedExamId ? 'style="background:#fef3f3"' : '';
      return '<tr ' + activeClass + '>' +
        '<td><strong>' + escHtml(e.name) + '</strong></td>' +
        '<td>' + typeLabel + '</td>' +
        '<td>' + e.duration + ' phút</td>' +
        '<td>' + qCount + ' câu</td>' +
        '<td>' + formatDate(e.createdAt) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn--secondary btn--sm" onclick="editExam(\'' + e.id + '\')" style="margin-right:4px">Sửa</button>' +
          '<button class="btn btn--secondary btn--sm" onclick="openQuestions(\'' + e.id + '\')" style="margin-right:4px">Câu hỏi</button>' +
          '<button class="btn btn--danger btn--sm" onclick="deleteExamConfirm(\'' + e.id + '\')">Xóa</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  renderExamTable();

  // ─── Exam modal (add/edit) ─────────────────────────────

  function openExamModal(examId) {
    editingExamId = examId || null;
    document.getElementById('examModalTitle').textContent = examId ? 'Sửa đề thi' : 'Thêm đề thi';
    document.getElementById('fExamNameErr').textContent = '';
    document.getElementById('fExamDurationErr').textContent = '';

    if (examId) {
      var e = DataService.getExamById(examId);
      document.getElementById('fExamName').value = e.name;
      document.getElementById('fExamDesc').value = e.description || '';
      document.getElementById('fExamType').value = e.type;
      document.getElementById('fExamDuration').value = e.duration;
      if (e.startTime) {
        var d = new Date(e.startTime);
        document.getElementById('fExamStartTime').value = d.toISOString().slice(0, 16);
      } else {
        document.getElementById('fExamStartTime').value = '';
      }
      toggleStartTime(e.type === 'scheduled');
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

  function toggleStartTime(show) {
    document.getElementById('startTimeGroup').classList[show ? 'remove' : 'add']('hidden');
  }

  document.getElementById('fExamType').addEventListener('change', function () {
    toggleStartTime(this.value === 'scheduled');
  });

  document.getElementById('btnAddExam').addEventListener('click', function () { openExamModal(null); });
  document.getElementById('closeExamModal').addEventListener('click', closeExamModal);
  document.getElementById('cancelExamModal').addEventListener('click', closeExamModal);

  function closeExamModal() {
    document.getElementById('examModal').classList.add('hidden');
  }

  document.getElementById('saveExamBtn').addEventListener('click', function () {
    var name = document.getElementById('fExamName').value.trim();
    var desc = document.getElementById('fExamDesc').value.trim();
    var type = document.getElementById('fExamType').value;
    var duration = parseInt(document.getElementById('fExamDuration').value, 10);
    var startTime = document.getElementById('fExamStartTime').value;

    var valid = true;
    if (!name) {
      document.getElementById('fExamNameErr').textContent = 'Vui lòng nhập tên đề thi.';
      valid = false;
    } else {
      document.getElementById('fExamNameErr').textContent = '';
    }
    if (!duration || duration < 1) {
      document.getElementById('fExamDurationErr').textContent = 'Thời gian phải ít nhất 1 phút.';
      valid = false;
    } else {
      document.getElementById('fExamDurationErr').textContent = '';
    }
    if (!valid) return;

    var examData;
    if (editingExamId) {
      examData = DataService.getExamById(editingExamId);
      examData.name = name;
      examData.description = desc;
      examData.type = type;
      examData.duration = duration;
      examData.startTime = (type === 'scheduled' && startTime) ? new Date(startTime).toISOString() : null;
    } else {
      examData = {
        id: DataService.generateId(),
        name: name,
        description: desc,
        type: type,
        duration: duration,
        startTime: (type === 'scheduled' && startTime) ? new Date(startTime).toISOString() : null,
        questions: [],
        createdAt: new Date().toISOString(),
      };
    }
    DataService.saveExam(examData);
    closeExamModal();
    renderExamTable();
  });

  // ─── Question panel ────────────────────────────────────

  function openQuestions(examId) {
    selectedExamId = examId;
    var exam = DataService.getExamById(examId);
    document.getElementById('qPanelTitle').textContent =
      'Câu hỏi — ' + exam.name + ' (' + (exam.questions || []).length + ' câu)';
    document.getElementById('questionPanel').classList.remove('hidden');
    document.getElementById('importSection').classList.add('hidden');
    document.getElementById('formatHint').textContent = ImportService.getExpectedFormat();
    renderQuestionList();
    renderExamTable(); // re-render to highlight selected row
    document.getElementById('questionPanel').scrollIntoView({ behavior: 'smooth' });
  }

  function renderQuestionList() {
    var exam = DataService.getExamById(selectedExamId);
    var qs = exam.questions || [];
    var list = document.getElementById('questionList');
    if (qs.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding:32px"><div class="empty-state__icon">📭</div>' +
        '<div class="empty-state__title">Chưa có câu hỏi</div>' +
        '<div class="empty-state__desc">Thêm câu hỏi mới hoặc nhập từ file Excel.</div></div>';
      return;
    }
    var html = qs.map(function (q, i) {
      return '<div class="question-item">' +
        '<span class="question-item__number">' + (i + 1) + '.</span>' +
        '<span class="question-item__text">' + escHtml(q.text) + '</span>' +
        '<div class="question-item__actions">' +
          '<button class="btn btn--ghost btn--sm" onclick="editQuestion(' + i + ')">Sửa</button>' +
          '<button class="btn btn--danger btn--sm" onclick="deleteQuestionConfirm(' + i + ')">Xóa</button>' +
        '</div>' +
        '</div>';
    }).join('');
    list.innerHTML = html;
  }

  // ─── Question modal ────────────────────────────────────

  function openQModal(qIdx) {
    editingQIdx = qIdx !== undefined ? qIdx : null;
    document.getElementById('qModalTitle').textContent = (editingQIdx !== null) ? 'Sửa câu hỏi' : 'Thêm câu hỏi';
    document.getElementById('fQTextErr').textContent = '';

    var q = (editingQIdx !== null)
      ? DataService.getExamById(selectedExamId).questions[editingQIdx]
      : null;

    document.getElementById('fQText').value = q ? q.text : '';
    document.getElementById('fQExplain').value = q ? (q.explanation || '') : '';

    var editor = document.getElementById('optionsEditor');
    var correctIdx = q ? q.correctAnswer : 0;
    var opts = q ? q.options : ['', '', '', ''];
    var labels = ['A', 'B', 'C', 'D'];
    editor.innerHTML = opts.map(function (opt, i) {
      return '<div class="option-row">' +
        '<input type="radio" name="correctOpt" value="' + i + '"' + (i === correctIdx ? ' checked' : '') + ' />' +
        '<input class="form-input opt-input" type="text" placeholder="Đáp án ' + labels[i] + '" value="' + escHtml(opt) + '" />' +
        '</div>';
    }).join('');

    document.getElementById('questionModal').classList.remove('hidden');
  }

  document.getElementById('btnAddQuestion').addEventListener('click', function () { openQModal(); });
  document.getElementById('closeQModal').addEventListener('click', closeQModal);
  document.getElementById('cancelQModal').addEventListener('click', closeQModal);

  function closeQModal() {
    document.getElementById('questionModal').classList.add('hidden');
  }

  document.getElementById('saveQBtn').addEventListener('click', function () {
    var text = document.getElementById('fQText').value.trim();
    var explain = document.getElementById('fQExplain').value.trim();
    var optInputs = document.querySelectorAll('.opt-input');
    var correctRadio = document.querySelector('input[name=correctOpt]:checked');

    if (!text) {
      document.getElementById('fQTextErr').textContent = 'Vui lòng nhập câu hỏi.';
      return;
    }
    document.getElementById('fQTextErr').textContent = '';

    var opts = Array.from(optInputs).map(function (el) { return el.value.trim(); });
    var correct = correctRadio ? parseInt(correctRadio.value, 10) : 0;

    var exam = DataService.getExamById(selectedExamId);
    if (!exam.questions) exam.questions = [];

    if (editingQIdx !== null) {
      exam.questions[editingQIdx] = {
        id: exam.questions[editingQIdx].id,
        text: text,
        options: opts,
        correctAnswer: correct,
        explanation: explain,
      };
    } else {
      exam.questions.push({
        id: DataService.generateId(),
        text: text,
        options: opts,
        correctAnswer: correct,
        explanation: explain,
      });
    }
    DataService.saveExam(exam);
    closeQModal();
    renderQuestionList();
    document.getElementById('qPanelTitle').textContent =
      'Câu hỏi — ' + exam.name + ' (' + exam.questions.length + ' câu)';
    renderExamTable();
  });

  // ─── Import from Excel ─────────────────────────────────

  document.getElementById('btnImportExcel').addEventListener('click', function () {
    document.getElementById('importSection').classList.toggle('hidden');
  });

  var importZone = document.getElementById('importZone');
  var fileInput  = document.getElementById('excelInput');

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
    var file = e.dataTransfer.files[0];
    if (file) processImport(file);
  });
  fileInput.addEventListener('change', function () {
    if (this.files[0]) processImport(this.files[0]);
    this.value = '';
  });

  function processImport(file) {
    var resultDiv = document.getElementById('importResult');
    resultDiv.innerHTML = '<div class="alert alert--info" style="margin-bottom:8px">⏳ Đang đọc file...</div>';

    ImportService.parseExcelFile(file).then(function (res) {
      if (res.errors.length > 0 && res.questions.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert--error">' +
          '❌ Lỗi: ' + res.errors.join('; ') + '</div>';
        return;
      }
      var exam = DataService.getExamById(selectedExamId);
      if (!exam.questions) exam.questions = [];
      res.questions.forEach(function (q) { exam.questions.push(q); });
      DataService.saveExam(exam);
      renderQuestionList();
      document.getElementById('qPanelTitle').textContent =
        'Câu hỏi — ' + exam.name + ' (' + exam.questions.length + ' câu)';
      renderExamTable();

      var msg = 'Nhập thành công ' + res.questions.length + ' câu hỏi.';
      if (res.errors.length > 0) {
        msg += ' Có ' + res.errors.length + ' hàng lỗi bị bỏ qua.';
      }
      resultDiv.innerHTML = '<div class="alert alert--success">✅ ' + msg + '</div>';
    });
  }

  // ─── Delete confirm ────────────────────────────────────

  function openDeleteModal(msg, cb) {
    document.getElementById('deleteModalMsg').textContent = msg;
    deleteCallback = cb;
    document.getElementById('deleteModal').classList.remove('hidden');
  }
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', function () {
    if (deleteCallback) deleteCallback();
    closeDeleteModal();
  });
  function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteCallback = null;
  }

  // ─── Expose to inline onclick ──────────────────────────

  window.editExam = function (id) { openExamModal(id); };

  window.openQuestions = function (id) { openQuestions(id); };

  window.deleteExamConfirm = function (id) {
    var exam = DataService.getExamById(id);
    openDeleteModal('Bạn có chắc muốn xóa đề thi "' + exam.name + '"? Tất cả kết quả liên quan vẫn còn.', function () {
      DataService.deleteExam(id);
      if (selectedExamId === id) {
        selectedExamId = null;
        document.getElementById('questionPanel').classList.add('hidden');
      }
      renderExamTable();
    });
  };

  window.editQuestion = function (idx) { openQModal(idx); };

  window.deleteQuestionConfirm = function (idx) {
    openDeleteModal('Bạn có chắc muốn xóa câu hỏi số ' + (idx + 1) + '?', function () {
      var exam = DataService.getExamById(selectedExamId);
      exam.questions.splice(idx, 1);
      DataService.saveExam(exam);
      renderQuestionList();
      document.getElementById('qPanelTitle').textContent =
        'Câu hỏi — ' + exam.name + ' (' + exam.questions.length + ' câu)';
      renderExamTable();
    });
  };

  // ─── Utils ────────────────────────────────────────────

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
  }
})();
