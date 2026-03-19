package com.httn.codechay.member2.adminexam.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.httn.codechay.member2.adminexam.dto.ExamUpsertRequest;
import com.httn.codechay.member2.adminexam.service.AdminExamService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/exams")
public class AdminExamController {
    private final AdminExamService service;

    public AdminExamController(AdminExamService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Object> createExam(@Valid @RequestBody ExamUpsertRequest req) {
        Object created = service.createExam(req);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{examId}")
    public ResponseEntity<Object> updateExam( 
            @PathVariable String examId,
            @Valid @RequestBody ExamUpsertRequest req) {
        Object updated = service.updateExam(examId, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable String examId) {
        service.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }
}
