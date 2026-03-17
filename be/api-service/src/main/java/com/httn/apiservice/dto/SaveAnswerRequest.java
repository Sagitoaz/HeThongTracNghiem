package com.httn.apiservice.dto;

import jakarta.validation.constraints.*;

public record SaveAnswerRequest(
        @NotBlank String questionId,
        @Min(0) @Max(3) int selectedOptionIndex
) {}
