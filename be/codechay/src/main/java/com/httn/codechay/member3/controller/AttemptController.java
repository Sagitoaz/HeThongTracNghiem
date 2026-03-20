package com.httn.codechay.member3.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping; 

import com.httn.codechay.common.ApiException;
import com.httn.codechay.member3.dto.SaveAnswerRequest;
import com.httn.codechay.member3.dto.SaveAnswerResponse;
import com.httn.codechay.member3.dto.StartAttemptResponse;
import com.httn.codechay.member3.dto.SubmitAttemptResponse;
import com.httn.codechay.member3.service.AttemptService;

import jakarta.validation.Valid;

@RestController
@RequestMapping
public class AttemptController {
    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping("/exams/{examId}/attempts/start")
    public ResponseEntity<StartAttemptResponse> startAttempt(
            @PathVariable String examId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt == null ? null : jwt.getSubject();
        if (studentId == null || studentId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "401", "Missing user identity");
        }

        StartAttemptResponse response = attemptService.startAttempt(examId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<SaveAnswerResponse> saveAnswer(
            @PathVariable String attemptId,
            @Valid @RequestBody SaveAnswerRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt == null ? null : jwt.getSubject();
        if (studentId == null || studentId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "401", "Missing user identity");
        }

        SaveAnswerResponse response = attemptService.saveAnswer(attemptId, studentId, req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<SubmitAttemptResponse> submitAttempt(
            @PathVariable String attemptId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt == null ? null : jwt.getSubject();
        if (studentId == null || studentId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "401", "Missing user identity");    
        }
        SubmitAttemptResponse response = attemptService.submitAttempt(attemptId, studentId);
        return ResponseEntity.ok(response);
    }
}
