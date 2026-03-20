package com.httn.codechay.member1.examread;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExamReadController {
    private final ExamReadService examReadService;

    public ExamReadController(ExamReadService examReadService) {
        this.examReadService = examReadService;
    }

    @GetMapping("/exams")
    public Object listExams(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        return examReadService.listExams(keyword, type, status, page, size, sort);
    }

    @GetMapping("/exams/{examId}")
    public Object examDetail(@PathVariable String examId) {
        return examReadService.examDetail(examId);
    }

    @GetMapping("/admin/exams")
    public Object adminExams(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        return examReadService.adminExams(keyword, type, status, page, size, sort);
    }
}

