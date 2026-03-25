/**
 * export-service.js - PDF export using jsPDF
 * Depends on: jsPDF CDN (window.jspdf.jsPDF)
 */
const ExportService = (function () {

  function getJsPDF() {
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if (typeof jsPDF !== 'undefined') {
      return jsPDF;
    }
    return null;
  }

  /**
   * Export exam statistics to PDF.
   * @param {{ examName, attempts, averageScore, scoreDistribution, results }} stats
   */
  function exportStatsPDF(stats) {
    var JPDF = getJsPDF();
    if (!JPDF) { alert('Thư viện jsPDF chưa được tải.'); return; }

    var doc = new JPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var y = 20;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(192, 40, 45);
    doc.text('Thống kê kết quả thi', 20, y);
    y += 8;

    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text('Đề thi: ' + stats.examName, 20, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Ngày xuất: ' + new Date().toLocaleDateString('vi-VN'), 20, y);
    y += 10;

    // Summary table
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 8, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont(undefined, 'bold');
    doc.text('Chỉ số', 22, y + 5.5);
    doc.text('Giá trị', 120, y + 5.5);
    y += 8;

    var summaryRows = [
      ['Tổng lượt nộp bài', String(stats.attempts)],
      ['Điểm trung bình', stats.averageScore + ' / 10'],
    ];

    doc.setFont(undefined, 'normal');
    summaryRows.forEach(function (row) {
      doc.text(row[0], 22, y + 5.5);
      doc.text(row[1], 120, y + 5.5);
      doc.rect(20, y, 170, 8);
      y += 8;
    });
    y += 6;

    // Score distribution title
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Phân phối điểm', 20, y);
    y += 6;

    var bucketLabels = ['0 - <2', '2 - <4', '4 - <6', '6 - <8', '8 - 10'];
    var dist = stats.scoreDistribution || [0, 0, 0, 0, 0];

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.rect(20, y, 170, 8, 'FD');
    doc.text('Khoảng điểm', 22, y + 5.5);
    doc.text('Số lượng', 100, y + 5.5);
    doc.text('Tỉ lệ (%)', 140, y + 5.5);
    y += 8;

    doc.setFont(undefined, 'normal');
    bucketLabels.forEach(function (label, i) {
      var pct = stats.attempts > 0 ? ((dist[i] / stats.attempts) * 100).toFixed(1) : '0.0';
      doc.text(label, 22, y + 5.5);
      doc.text(String(dist[i]), 100, y + 5.5);
      doc.text(pct + '%', 140, y + 5.5);
      doc.rect(20, y, 170, 8);
      y += 8;
    });
    y += 8;

    // Student list
    if (stats.results && stats.results.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Danh sách kết quả sinh viên', 20, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y, 170, 7, 'FD');
      doc.setFont(undefined, 'bold');
      doc.text('STT', 22, y + 5);
      doc.text('Tên đăng nhập', 35, y + 5);
      doc.text('Điểm', 100, y + 5);
      doc.text('Số câu đúng', 120, y + 5);
      doc.text('Thời điểm nộp', 148, y + 5);
      y += 7;

      doc.setFont(undefined, 'normal');
      stats.results.forEach(function (r, i) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        var dt = new Date(r.submittedAt).toLocaleDateString('vi-VN');
        doc.text(String(i + 1), 22, y + 5);
        doc.text(r.username, 35, y + 5);
        doc.text(r.score.toFixed(1), 100, y + 5);
        doc.text(r.correct + '/' + r.total, 120, y + 5);
        doc.text(dt, 148, y + 5);
        doc.rect(20, y, 170, 7);
        y += 7;
      });
    }

    doc.save('thong-ke-' + sanitizeFilename(stats.examName) + '.pdf');
  }

  /**
   * Export a single student's results to PDF.
   * @param {{ id, username, email }} student
   * @param {ExamResult[]} results
   */
  function exportStudentResultPDF(student, results) {
    var JPDF = getJsPDF();
    if (!JPDF) { alert('Thư viện jsPDF chưa được tải.'); return; }

    var doc = new JPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var y = 20;

    doc.setFontSize(18);
    doc.setTextColor(192, 40, 45);
    doc.text('Kết quả thi của sinh viên', 20, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text('Sinh viên: ' + student.username, 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Email: ' + (student.email || ''), 20, y);
    y += 6;
    doc.text('Ngày xuất: ' + new Date().toLocaleDateString('vi-VN'), 20, y);
    y += 10;

    if (results.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('Chưa có kết quả nào.', 20, y);
    } else {
      doc.setFontSize(10);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y, 170, 8, 'FD');
      doc.setFont(undefined, 'bold');
      doc.text('STT', 22, y + 5.5);
      doc.text('Tên bài thi', 35, y + 5.5);
      doc.text('Điểm', 110, y + 5.5);
      doc.text('Đúng/Tổng', 130, y + 5.5);
      doc.text('Nộp lúc', 155, y + 5.5);
      y += 8;

      doc.setFont(undefined, 'normal');
      results.forEach(function (r, i) {
        if (y > 270) { doc.addPage(); y = 20; }
        var dt = new Date(r.submittedAt).toLocaleDateString('vi-VN');
        doc.text(String(i + 1), 22, y + 5.5);
        var name = r.examName.length > 30 ? r.examName.slice(0, 28) + '..' : r.examName;
        doc.text(name, 35, y + 5.5);
        doc.text(r.score.toFixed(1), 110, y + 5.5);
        doc.text(r.correct + '/' + r.total, 130, y + 5.5);
        doc.text(dt, 155, y + 5.5);
        doc.rect(20, y, 170, 8);
        y += 8;
      });

      // Summary
      y += 4;
      var avg = results.reduce(function (s, r) { return s + r.score; }, 0) / results.length;
      doc.setFont(undefined, 'bold');
      doc.text('Điểm trung bình: ' + avg.toFixed(1) + ' / 10', 20, y);
    }

    doc.save('ket-qua-' + sanitizeFilename(student.username) + '.pdf');
  }

  function sanitizeFilename(str) {
    return String(str).replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase().slice(0, 40);
  }

  return {
    exportStatsPDF,
    exportStudentResultPDF,
  };
})();

