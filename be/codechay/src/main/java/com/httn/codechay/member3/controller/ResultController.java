package com.httn.codechay.member3.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.httn.codechay.common.ApiException;
import com.httn.codechay.member3.dto.ResultDetailResponse;
import com.httn.codechay.member3.service.ResultService;

@RestController
@RequestMapping
public class ResultController {
    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/results/{resultId}")
    public ResponseEntity<ResultDetailResponse> getResultDetail(
            @PathVariable String resultId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt == null ? null : jwt.getSubject();
        if (studentId == null || studentId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Missing user identity");
        }
        ResultDetailResponse response = resultService.getResultDetail(resultId, studentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/results")
    public ResponseEntity<Map<String, Object>> getMyResults(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String studentId = jwt == null ? null : jwt.getSubject();
        if (studentId == null || studentId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Missing user identity");
        }
        Map<String, Object> response = resultService.getMyResults(studentId, examId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/students/{studentId}/results")
    public ResponseEntity<Map<String, Object>> getStudentResultsForAdmin(
            @PathVariable String studentId,
            @RequestParam(required = false) String examId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Map<String, Object> response = resultService.getStudentResultsForAdmin(studentId, examId, page, size);
        return ResponseEntity.ok(response);
    }
}
