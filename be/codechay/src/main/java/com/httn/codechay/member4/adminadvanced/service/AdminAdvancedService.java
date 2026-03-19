package com.httn.codechay.member4.adminadvanced.service;

import com.httn.codechay.common.ApiException;
import com.httn.codechay.common.ErrorCode;
import com.httn.codechay.member4.adminadvanced.repository.AdminAdvancedRepository;
import com.httn.codechay.security.CurrentUser;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AdminAdvancedService {
    private final AdminAdvancedRepository repo;
    private final DataFormatter dataFormatter = new DataFormatter();

    public AdminAdvancedService(AdminAdvancedRepository repo) {
        this.repo = repo;
    }

    public void deleteQuestion(String examId, String questionId, String userId) {
        requireAdmin(userId);

        if (!repo.examExists(examId)) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    ErrorCode.NOT_FOUND,
                    "Exam not found"
            );
        }

        int updated = repo.deleteQuestion(examId, questionId, userId);
        if (updated == 0) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    ErrorCode.NOT_FOUND,
                    "Question not found"
            );
        }
    }

    public Map<String, Object> importQuestions(String examId, MultipartFile file, String userId) {
        requireAdmin(userId);

        if (!repo.examExists(examId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Exam not found");
        }
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "File is required");
        }

        String jobId = repo.createImportJob(examId, userId, "processing");
        int imported = 0;
        List<Map<String, Object>> errors = new ArrayList<>();

        try (var workbook = new XSSFWorkbook(file.getInputStream())) {
            var sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                try {
                    String text = requiredCell(row, 0, "question_text");
                    String optionA = requiredCell(row, 1, "option_a");
                    String optionB = requiredCell(row, 2, "option_b");
                    String optionC = requiredCell(row, 3, "option_c");
                    String optionD = requiredCell(row, 4, "option_d");
                    int correctOptionIndex = requiredIntegerCell(row, 5, "correct_option_index");
                    if (correctOptionIndex < 0 || correctOptionIndex > 3) {
                        throw new IllegalArgumentException("correct_option_index must be between 0 and 3");
                    }
                    String explanation = optionalCell(row, 6);

                    repo.insertQuestion(examId, text, optionA, optionB, optionC, optionD, correctOptionIndex, explanation);
                    imported++;
                } catch (Exception ex) {
                    int rowNumber = i + 1;
                    String message = ex.getMessage() == null ? "Invalid row" : ex.getMessage();
                    errors.add(Map.of("row", rowNumber, "message", message));
                    repo.insertImportJobError(jobId, rowNumber, message);
                }
            }

            repo.completeImportJob(jobId, imported, errors.size());
            return Map.of(
                    "importedCount", imported,
                    "failedCount", errors.size(),
                    "errors", errors
            );
        } catch (IOException ex) {
            repo.failImportJob(jobId);
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Cannot parse XLSX file");
        } catch (RuntimeException ex) {
            repo.failImportJob(jobId);
            throw ex;
        }
    }

    public ExportPayload exportExamResults(
            String examId,
            String format,
            LocalDate fromDate,
            LocalDate toDate,
            String userId
    ) {
        requireAdmin(userId);
        String normalizedFormat = validateFormat(format);

        if (!repo.examExists(examId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Exam not found");
        }

        String jobId = repo.createExportJob(userId, "exam", examId, normalizedFormat, "processing");

        try {
            List<Map<String, Object>> rows = repo.listExamResults(examId, fromDate, toDate);
            String fileName = "exam-" + examId + "-results." + normalizedFormat;
            repo.completeExportJob(jobId, fileName);
            return exportPayload(rows, normalizedFormat, fileName);
        } catch (RuntimeException ex) {
            repo.failExportJob(jobId);
            throw ex;
        }
    }

    public ExportPayload exportStudentResults(String studentId, String format, String userId) {
        requireAdmin(userId);
        String normalizedFormat = validateFormat(format);

        if (!repo.studentExists(studentId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Student not found");
        }

        String jobId = repo.createExportJob(userId, "student", studentId, normalizedFormat, "processing");

        try {
            List<Map<String, Object>> rows = repo.listStudentResults(studentId);
            String fileName = "student-" + studentId + "-results." + normalizedFormat;
            repo.completeExportJob(jobId, fileName);
            return exportPayload(rows, normalizedFormat, fileName);
        } catch (RuntimeException ex) {
            repo.failExportJob(jobId);
            throw ex;
        }
    }

    public Map<String, Object> getStatisticsOverview(String userId) {
        requireAdmin(userId);
        return repo.overviewStats();
    }

    public Map<String, Object> getExamStatistics(String examId, String userId) {
        requireAdmin(userId);
        if (!repo.examExists(examId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Exam not found");
        }
        return repo.examStats(examId);
    }

    private byte[] buildExportBytes(List<Map<String, Object>> rows, String format) {
        if ("pdf".equals(format)) {
            return exportResultsPdf(rows);
        }
        return exportResultsXlsx(rows);
    }

    private ExportPayload exportPayload(List<Map<String, Object>> rows, String format, String fileName) {
        byte[] data = buildExportBytes(rows, format);
        return new ExportPayload(data, contentType(format), fileName);
    }

    private byte[] exportResultsXlsx(List<Map<String, Object>> rows) {
        try (var workbook = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("results");
            var header = sheet.createRow(0);
            header.createCell(0).setCellValue("resultId");
            header.createCell(1).setCellValue("examId");
            header.createCell(2).setCellValue("examName");
            header.createCell(3).setCellValue("userId");
            header.createCell(4).setCellValue("username");
            header.createCell(5).setCellValue("score");
            header.createCell(6).setCellValue("correct");
            header.createCell(7).setCellValue("total");
            header.createCell(8).setCellValue("submittedAt");

            int rowIndex = 1;
            for (Map<String, Object> row : rows) {
                var line = sheet.createRow(rowIndex++);
                line.createCell(0).setCellValue(String.valueOf(row.get("resultid")));
                line.createCell(1).setCellValue(String.valueOf(row.get("examid")));
                line.createCell(2).setCellValue(String.valueOf(row.get("examname")));
                line.createCell(3).setCellValue(String.valueOf(row.get("userid")));
                line.createCell(4).setCellValue(String.valueOf(row.get("username")));
                line.createCell(5).setCellValue(String.valueOf(row.get("score")));
                line.createCell(6).setCellValue(String.valueOf(row.get("correctcount")));
                line.createCell(7).setCellValue(String.valueOf(row.get("totalcount")));
                line.createCell(8).setCellValue(String.valueOf(row.get("submittedat")));
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Cannot create XLSX file");
        }
    }

    private byte[] exportResultsPdf(List<Map<String, Object>> rows) {
        try (var out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("HTTN Results Export"));
            document.add(new Paragraph(" "));

            for (Map<String, Object> row : rows) {
                String line = String.format(
                        "Result=%s | Exam=%s | User=%s | Score=%s | Correct=%s/%s",
                        row.get("resultid"),
                        row.get("examname"),
                        row.get("username"),
                        row.get("score"),
                        row.get("correctcount"),
                        row.get("totalcount")
                );
                document.add(new Paragraph(line));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Cannot create PDF file");
        }
    }

    private String contentType(String format) {
        if ("pdf".equals(format)) {
            return "application/pdf";
        }
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    private String validateFormat(String format) {
        if (format == null || format.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "format is required");
        }
        String normalized = format.trim().toLowerCase();
        if (!"pdf".equals(normalized) && !"xlsx".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Unsupported format");
        }
        return normalized;
    }

    private void requireAdmin(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Unauthorized");
        }
        if (!CurrentUser.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Admin role required");
        }
    }

    private String requiredCell(Row row, int index, String name) {
        String value = optionalCell(row, index);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(name + " is required");
        }
        return value;
    }

    private int requiredIntegerCell(Row row, int index, String name) {
        String value = requiredCell(row, index, name);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(name + " must be integer");
        }
    }

    private String optionalCell(Row row, int index) {
        if (row.getCell(index) == null) {
            return null;
        }
        String value = dataFormatter.formatCellValue(row.getCell(index));
        if (value == null) {
            return null;
        }
        value = value.trim();
        return value.isBlank() ? null : value;
    }

    public record ExportPayload(byte[] data, String contentType, String fileName) {
        
    }
}
