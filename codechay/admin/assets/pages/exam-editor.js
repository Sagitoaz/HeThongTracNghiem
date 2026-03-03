// assets/pages/exam-editor.js
seedIfEmpty();

let examId = getQueryParam("examId"); // null nếu tạo mới
let editingQId = null;

function findExam() {
  const exams = DB.listExams();
  return examId ? exams.find((e) => e.id === examId) : null;
}

function setExamForm(exam) {
  $("#pageTitle").textContent = exam
    ? `Chỉnh sửa kỳ thi (${exam.id})`
    : "Tạo kỳ thi";
  $("#examName").value = exam?.name || "";
  $("#examDesc").value = exam?.desc || "";
  $("#examType").value = exam?.type || "free";
  $("#examDuration").value = exam?.durationMin ?? "";
  renderQuestions(exam?.questions || []);
}

function saveExam() {
  const name = $("#examName").value.trim();
  if (!name) {
    alert("Tên kỳ thi không được trống");
    return;
  }

  const desc = $("#examDesc").value.trim();
  const type = $("#examType").value;
  const durationMin =
    type === "timed" ? Number($("#examDuration").value || 0) : null;

  const exams = DB.listExams();
  let exam = findExam();

  if (!exam) {
    examId = uid("E");
    exam = { id: examId, createdAt: today(), questions: [] };
    exams.unshift(exam);
  }

  exam.name = name;
  exam.desc = desc;
  exam.type = type;
  exam.durationMin = durationMin;

  DB.saveExams(exams);
  history.replaceState({}, "", "./exam-editor.html?examId=" + examId);
  setExamForm(exam);
  alert("Đã lưu kỳ thi");
}

function renderQuestions(questions) {
  $("#qRows").innerHTML = questions
    .map(
      (q, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${q.text}</td>
      <td><b>${"ABCD"[q.correctIndex]}</b></td>
      <td class="row">
        <button class="btn btn-sm btn-ghost" data-edit-q="${q.id}">Sửa</button>
        <button class="btn btn-sm btn-danger" data-del-q="${q.id}">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function clearQForm() {
  editingQId = null;
  $("#qText").value = "";
  $("#optA").value = "";
  $("#optB").value = "";
  $("#optC").value = "";
  $("#optD").value = "";
  $("#qCorrect").value = "0";
  $("#qHint").textContent = "Đang ở chế độ: thêm câu mới";
}

function loadQToForm(qId) {
  const exam = findExam();
  if (!exam) return;
  const q = exam.questions.find((x) => x.id === qId);
  if (!q) return;

  editingQId = qId;
  $("#qText").value = q.text;
  $("#optA").value = q.options[0] || "";
  $("#optB").value = q.options[1] || "";
  $("#optC").value = q.options[2] || "";
  $("#optD").value = q.options[3] || "";
  $("#qCorrect").value = String(q.correctIndex);
  $("#qHint").textContent = `Đang sửa câu: ${q.id}`;
}

function saveQuestion() {
  const exam = findExam();
  if (!exam) {
    alert("Bạn cần Lưu kỳ thi trước");
    return;
  }

  const text = $("#qText").value.trim();
  if (!text) {
    alert("Câu hỏi không được trống");
    return;
  }

  const options = [
    $("#optA").value.trim(),
    $("#optB").value.trim(),
    $("#optC").value.trim(),
    $("#optD").value.trim(),
  ];
  const correctIndex = Number($("#qCorrect").value);

  const exams = DB.listExams();
  const e = exams.find((x) => x.id === exam.id);

  if (editingQId) {
    const q = e.questions.find((x) => x.id === editingQId);
    if (!q) return;
    q.text = text;
    q.options = options;
    q.correctIndex = correctIndex;
  } else {
    e.questions.push({
      id: uid("Q"),
      text,
      options,
      correctIndex,
    });
  }

  DB.saveExams(exams);
  clearQForm();
  setExamForm(e);
}

async function importExcel() {
  const exam = findExam();
  if (!exam) {
    alert("Bạn cần Lưu kỳ thi trước");
    return;
  }

  const file = $("#excelFile").files?.[0];
  if (!file) {
    alert("Chọn file Excel");
    return;
  }

  const rows = await readExcelRows(file);
  const mine = rows.filter((r) => String(r.examId || "").trim() === exam.id);

  if (!mine.length) {
    alert("Không có dòng nào khớp examId=" + exam.id);
    return;
  }

  const exams = DB.listExams();
  const e = exams.find((x) => x.id === exam.id);

  mine.forEach((r) => {
    const correct = String(r.correct || "A").toUpperCase();
    const idx = Math.max(0, "ABCD".indexOf(correct));
    e.questions.push({
      id: uid("Q"),
      text: String(r.question || "").trim(),
      options: [r.A, r.B, r.C, r.D].map((v) => String(v ?? "")),
      correctIndex: idx,
    });
  });

  DB.saveExams(exams);
  setExamForm(e);
  alert("Import xong: +" + mine.length + " câu");
}

document.addEventListener("click", (e) => {
  const editId = e.target?.dataset?.editQ;
  if (editId) loadQToForm(editId);

  const delId = e.target?.dataset?.delQ;
  if (delId) {
    const exams = DB.listExams();
    const ex = exams.find((x) => x.id === examId);
    ex.questions = ex.questions.filter((q) => q.id !== delId);
    DB.saveExams(exams);
    setExamForm(ex);
  }
});

$("#btnSaveExam").addEventListener("click", saveExam);
$("#btnNewExam").addEventListener("click", () => {
  examId = null;
  history.replaceState({}, "", "./exam-editor.html");
  clearQForm();
  setExamForm(null);
});

$("#btnClearQ").addEventListener("click", clearQForm);
$("#btnSaveQ").addEventListener("click", saveQuestion);
$("#btnImportExcel").addEventListener("click", importExcel);

clearQForm();
setExamForm(findExam());
