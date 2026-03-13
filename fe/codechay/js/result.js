// result.js — Trang kết quả (codechay/result.html)

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function renderResult() {
    // Prefer live result from exam submission; fall back to mock data
    const stored = sessionStorage.getItem('ptit_exam_result');
    const data   = stored ? JSON.parse(stored) : MockAPI.getMyResult();

    // Header summary
    document.getElementById('rs-score').textContent    = data.score.toFixed(1);
    document.getElementById('rs-meta').textContent     = `Đúng: ${data.correct}/${data.total}`;
    document.getElementById('rs-exam').textContent     = data.exam;
    document.getElementById('rs-duration').textContent = data.duration;
    document.getElementById('rs-submitted').textContent = data.submittedAt;

    // Pie chart
    const pct = (data.correct / data.total * 100).toFixed(1);
    document.querySelector('.chart').style.background =
        `conic-gradient(#16a34a 0% ${pct}%, #ef4444 ${pct}% 100%)`;

    // Question-by-question review
    const container = document.getElementById('questions-list');
    container.innerHTML = data.questions.map((q) => {
        const isCorrect = q.chosenIndex === q.correctIndex;
        const optionsHtml = q.options.map((opt, i) => {
            let cls = 'option';
            if (i === q.correctIndex)                 cls += ' correct';
            else if (i === q.chosenIndex && !isCorrect) cls += ' wrong-chosen';
            return `<div class="${cls}">
                <span class="opt-letter">${LETTERS[i]}</span>
                <span class="opt-text">${opt}</span>
            </div>`;
        }).join('');

        return `<div class="question-card">
            <div class="q-head">
                <div class="q-left">
                    <p class="q-number">CÂU ${q.number}</p>
                    <p class="q-text">${q.text}</p>
                </div>
                <span class="q-badge ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? 'Đúng' : 'Sai'}</span>
            </div>
            <div class="options">${optionsHtml}</div>
            <div class="explain"><span class="bulb">💡</span><p>${q.explain}</p></div>
        </div>`;
    }).join('');
}

renderResult();
