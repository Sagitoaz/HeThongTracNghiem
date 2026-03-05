// app.js — Trang danh sách kỳ thi (codechay/index.html)

const searchInput  = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const examList     = document.getElementById("examList");
const exams        = MockData.exams;

const isExamActive = (exam) => {
    if (exam.type === "free") return true;
    const now   = new Date();
    const start = new Date(exam.startTime);
    return now >= start;
};

const renderExam = (list) => {
    examList.innerHTML = "";
    list.forEach((exam, index) => {
        const card = document.createElement("div");
        card.className = "exam-card";

        const h3 = document.createElement("h3");
        h3.textContent = exam.name;

        const p0 = document.createElement("p");
        p0.textContent = exam.type.toUpperCase();

        const p1 = document.createElement("p");
        p1.textContent = "⏱ " + exam.duration + " phút  📝 " + exam.questions.length + " câu";

        const p2 = document.createElement("p");
        p2.textContent = exam.description;

        const buttonJoin = document.createElement("button");
        buttonJoin.id = "btn";
        buttonJoin.textContent = "Bắt đầu thi";

        if (!isExamActive(exam)) buttonJoin.disabled = true;

        // exam.html is at same root level as index.html
        buttonJoin.onclick = () => { window.location.href = "exam.html?exam=" + index; };

        card.appendChild(h3);
        card.appendChild(p0);
        card.appendChild(p1);
        card.appendChild(p2);

        if (exam.type === "scheduled") {
            const p3 = document.createElement("p");
            const dateStart = new Date(exam.startTime);
            p3.textContent = "Bắt đầu lúc: " +
                dateStart.getHours() + ":" +
                String(dateStart.getMinutes()).padStart(2, '0') + "  " +
                dateStart.getDate() + "/" + (dateStart.getMonth() + 1) + "/" + dateStart.getFullYear();
            card.appendChild(p3);
        }
        card.appendChild(buttonJoin);
        examList.appendChild(card);
    });
};

const applyFilterAndRender = () => {
    const searchText = searchInput.value.toLowerCase();
    const status     = statusFilter.value;
    const filtered   = exams.filter(exam => {
        const matchName = exam.name.toLowerCase().includes(searchText);
        const matchType = status === "all" || status === exam.type;
        return matchName && matchType;
    });
    renderExam(filtered);
};

renderExam(exams);

searchInput.addEventListener("input",  applyFilterAndRender);
statusFilter.addEventListener("change", applyFilterAndRender);
