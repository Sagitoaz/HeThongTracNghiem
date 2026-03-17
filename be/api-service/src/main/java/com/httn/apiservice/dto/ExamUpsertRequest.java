package com.httn.apiservice.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;

public record ExamUpsertRequest(
        @NotBlank @Size(min = 3, max = 255) String name,
        @Size(max = 2000) String description,
        @NotBlank String type,
        @Min(1) @Max(300) Integer durationMinutes,
        Instant startTime
) {}
