package com.httn.codechay.member3.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SaveAnswerRequest(
        @NotBlank(message = "questionId is required")
        String questionId,

        @Min(value = 0, message = "selectedOptionIndex must be between 0 and 3")
        @Max(value = 3, message = "selectedOptionIndex must be between 0 and 3")
        int selectedOptionIndex
) {}
