// student-results.js — Trang kết quả sinh viên (codechay/admin/student-results.html)

function scoreBadge(score) {
    const cls = score >= 8 ? 'good' : score >= 5 ? 'mid' : 'bad';
    return `<span class="score ${cls}">${score.toFixed(1)}</span>`;
}

function exportPDF(r) {
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Kết quả - ${r.username}</title>
            <link rel="stylesheet" href="../css/pdf-print.css">
        </head>
        <body>
            <h1>Kết quả bài thi</h1>
            <p class="sub">Xuất lúc: ${new Date().toLocaleString('vi-VN')}</p>
            <table>
                <tr><th>Sinh viên</th><td>${r.username}</td></tr>
                <tr><th>Đề thi</th><td>${r.exam}</td></tr>
                <tr><th>Điểm</th><td class="score">${r.score.toFixed(1)}</td></tr>
                <tr><th>Câu đúng</th><td>${r.correct}/${r.total}</td></tr>
                <tr><th>Thời gian làm bài</th><td>${r.duration}</td></tr>
                <tr><th>Nộp lúc</th><td>${r.submittedAt}</td></tr>
            </table>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.print();
}

function renderTable(data) {
    const tbody = document.getElementById('results-tbody');
    document.getElementById('result-count').textContent = `Danh sách kết quả (${data.length})`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:24px">Không có kết quả nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map((r, i) => `<tr>
        <td>${r.username}</td>
        <td>${r.exam}</td>
        <td>${scoreBadge(r.score)}</td>
        <td>${r.correct}/${r.total}</td>
        <td>${r.duration}</td>
        <td>${r.submittedAt}</td>
        <td class="col-action"><button class="btn btn-soft" data-index="${i}">PDF</button></td>
    </tr>`).join('');

    tbody._data = data;
}

function applyFilter() {
    const username = document.getElementById('username').value;
    const exam     = document.getElementById('exam').value;
    renderTable(MockAPI.filterResults(username, exam));
}

document.getElementById('username').addEventListener('input', applyFilter);
document.getElementById('exam').addEventListener('change', applyFilter);
document.querySelector('.btn-delete').addEventListener('click', () => {
    document.getElementById('username').value = '';
    document.getElementById('exam').selectedIndex = 0;
    applyFilter();
});

document.getElementById('results-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-index]');
    if (!btn) return;
    const tbody = document.getElementById('results-tbody');
    const r = tbody._data[+btn.dataset.index];
    if (r) exportPDF(r);
});

renderTable(MockAPI.getAllResults());
