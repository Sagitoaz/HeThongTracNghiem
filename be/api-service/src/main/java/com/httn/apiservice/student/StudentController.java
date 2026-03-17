package com.httn.apiservice.student;

import com.httn.apiservice.dto.SaveAnswerRequest;
import com.httn.apiservice.service.ApiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class StudentController {
    private final ApiService service;

    public StudentController(ApiService service) {
        this.service = service;
    }

    @GetMapping("/exams")
    public Object listExams(@RequestParam(required = false) String keyword,
                            @RequestParam(required = false, name = "type") String type,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "20") int size,
                            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return service.pagedExams(keyword, type, page, Math.min(size, 100), sort);
    }

    @GetMapping("/exams/{examId}")
    public Object examDetail(@PathVariable String examId) {
        return service.examDetail(examId);
    }

    @PostMapping("/exams/{examId}/attempts/start")
    @ResponseStatus(HttpStatus.CREATED)
    public Object startAttempt(@PathVariable String examId) {
        return service.startAttempt(examId);
    }

    @PutMapping("/attempts/{attemptId}/answers")
    public Object saveAnswer(@PathVariable String attemptId, @Valid @RequestBody SaveAnswerRequest request) {
        return service.saveAnswer(attemptId, request);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public Object submitAttempt(@PathVariable String attemptId) {
        return service.submitAttempt(attemptId);
    }

    @GetMapping("/results/{resultId}")
    public Object resultDetail(@PathVariable String resultId) {
        return service.resultDetail(resultId);
    }

    @GetMapping("/me/results")
    public Object myResults(@RequestParam(required = false) String examId,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "20") int size,
                            @RequestParam(defaultValue = "submittedAt,desc") String sort) {
        return service.myResults(examId, page, Math.min(size, 100), sort);
    }
}
