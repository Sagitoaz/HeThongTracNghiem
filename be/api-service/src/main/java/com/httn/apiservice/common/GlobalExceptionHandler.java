package com.httn.apiservice.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException ex, HttpServletRequest req) {
        return ResponseEntity.status(ex.getStatus()).body(build(ex.getStatus(), ex.getCode(), ex.getMessage(), req.getRequestURI()));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResponse> handleValidation(Exception ex, HttpServletRequest req) {
        String message;
        if (ex instanceof MethodArgumentNotValidException m) {
            message = m.getBindingResult().getFieldErrors().stream()
                    .map(e -> e.getField() + " " + e.getDefaultMessage())
                    .collect(Collectors.joining("; "));
        } else {
            message = ex.getMessage();
        }
        return ResponseEntity.badRequest().body(build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, message, req.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleDenied(AccessDeniedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(build(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Access denied", req.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, ex.getMessage(), req.getRequestURI()));
    }

    private ErrorResponse build(HttpStatus status, ErrorCode code, String message, String path) {
        return new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), code.name(), message, path);
    }
}
