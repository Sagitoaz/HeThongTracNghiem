package com.httn.codechay.member2.adminexam.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.httn.codechay.member2.adminexam.dto.QuestionUpsertRequest;
import com.httn.codechay.member2.adminexam.service.QuestionAdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/exams/{examId}/questions")
public class QuestionAdminController {
    private final QuestionAdminService service;

    public QuestionAdminController(QuestionAdminService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Object> listQuestions(@PathVariable String examId) {
        return ResponseEntity.ok(service.listQuestions(examId));
    }

    @PostMapping
    public ResponseEntity<Object> createQuestion(@PathVariable String examId,
            @Valid @RequestBody QuestionUpsertRequest req) {
        return ResponseEntity.status(201).body(service.createQuestion(examId, req));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<Object> updateQuestion(@PathVariable String examId,
            @PathVariable String questionId,
            @Valid @RequestBody QuestionUpsertRequest req) {
        return ResponseEntity.ok(service.updateQuestion(examId, questionId, req));
    }
}
