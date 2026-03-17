package com.httn.apiservice.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record QuestionUpsertRequest(
        @NotBlank @Size(min = 1, max = 2000) String text,
        @NotNull @Size(min = 4, max = 4) List<@NotBlank @Size(max = 500) String> options,
        @Min(0) @Max(3) Integer correctOptionIndex,
        @Size(max = 2000) String explanation
) {}
