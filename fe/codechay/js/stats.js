// assets/pages/stats.js
seedIfEmpty();

function loadExamOptions() {
  const exams = DB.listExams();
  $("#filterExam").innerHTML = `
    <option value="all">Tất cả</option>
    ${exams.map((e) => `<option value="${e.id}">${e.name} (${e.id})</option>`).join("")}
  `;
}

function applyFilter() {
  const examId = $("#filterExam").value;
  const from = $("#fromDate").value || "0000-01-01";
  const to = $("#toDate").value || "9999-12-31";

  const exams = DB.listExams();
  const users = DB.listUsers();
  const attempts = DB.listAttempts();

  const filtered = attempts.filter((a) => {
    const okExam = examId === "all" || a.examId === examId;
    const okDate = a.date >= from && a.date <= to;
    return okExam && okDate;
  });

  // KPI
  $("#kpiAttempts").textContent = filtered.length;
  const done = filtered.filter((a) => a.completed).length;
  $("#kpiDone").textContent = filtered.length
    ? Math.round((done * 100) / filtered.length) + "%"
    : "0%";
  $("#kpiAvg").textContent = avg(filtered.map((a) => a.score)).toFixed(2);

  // Table
  $("#rows").innerHTML = filtered
    .map((a) => {
      const ex = exams.find((e) => e.id === a.examId);
      const u = users.find((u) => u.id === a.userId);
      return `
      <tr>
        <td>${a.date}</td>
        <td>${ex?.name || a.examId}</td>
        <td>${u?.name || a.userId}</td>
        <td>${a.completed ? "✅" : "❌"}</td>
        <td><b>${a.score}</b></td>
      </tr>
    `;
    })
    .join("");

  // Chart
  drawHistogram(
    $("#chart"),
    filtered.map((a) => a.score),
  );

  return filtered;
}

$("#filterExam").addEventListener("change", applyFilter);
$("#fromDate").addEventListener("change", applyFilter);
$("#toDate").addEventListener("change", applyFilter);

$("#btnXlsx").addEventListener("click", () => {
  const filtered = applyFilter();
  exportToExcel("ptit_report.xlsx", filtered);
});

$("#btnPdf").addEventListener("click", () => {
  const filtered = applyFilter();
  const head = ["Date", "ExamId", "UserId", "Completed", "Score"];
  const body = filtered.map((a) => [
    a.date,
    a.examId,
    a.userId,
    a.completed ? "Yes" : "No",
    String(a.score),
  ]);
  exportToPDF("ptit_report.pdf", "PTIT - Bao cao thong ke", head, body);
});

loadExamOptions();
applyFilter();
