seedIfEmpty();

let editingUserId = null;

function renderDashboard() {
  const exams = DB.listExams();
  const users = DB.listUsers();
  const attempts = DB.listAttempts();

  $("#kpiExams").textContent = exams.length;
  $("#kpiStudents").textContent = users.filter(
    (u) => u.role === "student",
  ).length;
  $("#kpiAvg").textContent = avg(attempts.map((a) => a.score)).toFixed(2);

  $("#examRows").innerHTML = exams
    .map(
      (e) => `
    <tr>
      <td>${e.id}</td>
      <td>${e.name}</td>
      <td>${formatExamType(e)}</td>
      <td>${e.createdAt}</td>
      <td class="row">
        <a class="btn btn-sm btn-ghost" href="./exam-editor.html?examId=${e.id}">Sửa</a>
        <button class="btn btn-sm btn-danger" data-del-exam="${e.id}">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("");

  const students = users.filter((u) => u.role === "student");
  $("#userRows").innerHTML = students
    .map(
      (u) => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td class="row">
        <button class="btn btn-sm btn-ghost" data-edit-user="${u.id}">Sửa</button>
        <button class="btn btn-sm btn-danger" data-del-user="${u.id}">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function clearUserForm() {
  editingUserId = null;
  $("#uName").value = "";
  $("#uEmail").value = "";
  $("#userFormHint").textContent = "Đang ở chế độ: thêm mới";
}

function loadUserToForm(userId) {
  const users = DB.listUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return;
  editingUserId = userId;
  $("#uName").value = u.name;
  $("#uEmail").value = u.email;
  $("#userFormHint").textContent = `Đang sửa: ${u.id}`;
}

function saveUserFromForm() {
  const name = $("#uName").value.trim();
  const email = $("#uEmail").value.trim();
  if (!name || !email) {
    alert("Tên và email không được trống");
    return;
  }

  const users = DB.listUsers();

  if (editingUserId) {
    const u = users.find((x) => x.id === editingUserId);
    if (!u) return;
    u.name = name;
    u.email = email;
  } else {
    users.unshift({ id: uid("U"), name, email, role: "student" });
  }

  DB.saveUsers(users);
  clearUserForm();
  renderDashboard();
}

document.addEventListener("click", (e) => {
  const delExam = e.target?.dataset?.delExam;
  if (delExam) {
    const exams = DB.listExams().filter((x) => x.id !== delExam);
    DB.saveExams(exams);
    renderDashboard();
  }

  const delUser = e.target?.dataset?.delUser;
  if (delUser) {
    const users = DB.listUsers().filter((x) => x.id !== delUser);
    DB.saveUsers(users);
    renderDashboard();
  }

  const editUser = e.target?.dataset?.editUser;
  if (editUser) loadUserToForm(editUser);
});

$("#btnNewUser").addEventListener("click", () => {
  clearUserForm();
  $("#uName").focus();
});
$("#btnClearUser").addEventListener("click", clearUserForm);
$("#btnSaveUser").addEventListener("click", saveUserFromForm);

clearUserForm();
renderDashboard();
