/**
 * import-service.js — Excel import using SheetJS (xlsx)
 * Depends on: SheetJS CDN (window.XLSX)
 */
const ImportService = (function () {

  /**
   * Parse an Excel file and return a promise resolving to Question[].
   * Expected columns: A=text, B=optA, C=optB, D=optC, E=optD, F=correctAnswer(0-3), G=explanation
   * Row 1 is treated as header and skipped.
   * @param {File} file
   * @returns {Promise<{questions: Question[], errors: string[]}>}
   */
  function parseExcelFile(file) {
    return new Promise(function (resolve) {
      if (typeof XLSX === 'undefined') {
        resolve({ questions: [], errors: ['Thư viện SheetJS chưa được tải. Vui lòng kiểm tra kết nối.'] });
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var data = new Uint8Array(e.target.result);
          var wb = XLSX.read(data, { type: 'array' });
          var sheetName = wb.SheetNames[0];
          var ws = wb.Sheets[sheetName];
          var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          // Skip header row
          if (rows.length > 1) {
            rows = rows.slice(1);
          } else {
            resolve({ questions: [], errors: ['File Excel trống hoặc chỉ có hàng tiêu đề.'] });
            return;
          }
          var validated = validateRows(rows);
          resolve(validated);
        } catch (err) {
          resolve({ questions: [], errors: ['Không đọc được file: ' + err.message] });
        }
      };
      reader.onerror = function () {
        resolve({ questions: [], errors: ['Không thể đọc file.'] });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate rows and map to Question objects.
   * @param {any[][]} rows
   * @returns {{ questions: Question[], errors: string[] }}
   */
  function validateRows(rows) {
    var questions = [];
    var errors = [];

    rows.forEach(function (row, idx) {
      var lineNum = idx + 2; // 1-indexed + header
      var text = String(row[0] || '').trim();
      var optA = String(row[1] || '').trim();
      var optB = String(row[2] || '').trim();
      var optC = String(row[3] || '').trim();
      var optD = String(row[4] || '').trim();
      var correctRaw = row[5];
      var explanation = String(row[6] || '').trim();

      if (!text && !optA && !optB && !optC && !optD && correctRaw === '') return; // empty row skip

      var lineErrors = [];
      if (!text)        lineErrors.push('thiếu câu hỏi (cột A)');
      if (!optA)        lineErrors.push('thiếu đáp án A (cột B)');
      if (!optB)        lineErrors.push('thiếu đáp án B (cột C)');
      if (!optC)        lineErrors.push('thiếu đáp án C (cột D)');
      if (!optD)        lineErrors.push('thiếu đáp án D (cột E)');

      var correctNum = parseInt(correctRaw, 10);
      if (isNaN(correctNum) || correctNum < 0 || correctNum > 3) {
        lineErrors.push('đáp án đúng không hợp lệ (cột F — cần số 0, 1, 2 hoặc 3)');
      }

      if (lineErrors.length > 0) {
        errors.push('Hàng ' + lineNum + ': ' + lineErrors.join(', '));
        return;
      }

      questions.push({
        id: DataService.generateId(),
        text: text,
        options: [optA, optB, optC, optD],
        correctAnswer: correctNum,
        explanation: explanation,
      });
    });

    return { questions: questions, errors: errors };
  }

  /**
   * Return expected format description for UI hint.
   * @returns {string}
   */
  function getExpectedFormat() {
    return 'Cột A: Câu hỏi | Cột B: Đáp án A | Cột C: Đáp án B | Cột D: Đáp án C | ' +
           'Cột E: Đáp án D | Cột F: Đáp án đúng (0, 1, 2 hoặc 3) | Cột G: Giải thích (tùy chọn)';
  }

  return {
    parseExcelFile,
    validateRows,
    getExpectedFormat,
  };
})();
