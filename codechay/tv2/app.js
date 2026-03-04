const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const examList = document.getElementById("examList");
const exams = MockData.exams;
const isExamActive = (exam) =>{
    if(exam.type === "free"){
        return true;
    }
    else{
        let now = new Date();
        let start = new Date(exam.startTime)
        return now >= start;
    }
};

const renderExam = (list) =>{
    examList.innerHTML = ""
    
    list.forEach(exam => {
        const card = document.createElement("div");
        card.className = "exam-card";
        examList.appendChild(card)
        const h3 = document.createElement("h3");
        h3.textContent = exam.name
        const p0 = document.createElement("p");
        p0.textContent = exam.type.toUpperCase()
        const p1 = document.createElement("p");
        const p2 = document.createElement("p");
        p1.textContent = "⏱ " + exam.duration + "phút " + "📝" + exam.questions.length +  " câu";
        p2.textContent = exam.description
        const buttonJoin = document.createElement("button");
        buttonJoin.id = "btn"
        buttonJoin.textContent = "BẮT ĐẦU THI"
        if(!isExamActive(exam)){
            buttonJoin.disabled = true
        }

        card.appendChild(h3);
        card.appendChild(p0);
        card.appendChild(p1);
        card.appendChild(p2);
        if(exam.type == "scheduled"){
            const p3 = document.createElement("p")
            let dateStart = new Date(exam.startTime)
            p3.textContent = "Bắt đầu lúc: " + dateStart.getHours() + ":" + dateStart.getMinutes() + " " +
             dateStart.getDate() + "/"  + dateStart.getMonth()  + "/" +dateStart.getFullYear() ;
             
            card.appendChild(p3)
        }
        card.appendChild(buttonJoin);
    })
}
const applyFilterAndRender = () =>{
    const searchText = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    let examsFilter = exams.filter(exam => {
        const matchName =  exam.name.toLowerCase().includes(searchText);
        const matchType = status === "all" || status === exam.type;
        return matchName && matchType;

    });
    return examsFilter
};

renderExam(exams)

searchInput.addEventListener("input", () =>{
    renderExam(applyFilterAndRender());
})
statusFilter.addEventListener("change", () =>{
    renderExam(applyFilterAndRender());
})

