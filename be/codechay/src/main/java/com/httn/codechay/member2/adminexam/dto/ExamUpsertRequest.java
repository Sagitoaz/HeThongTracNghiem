package com.httn.codechay.member2.adminexam.dto;

import java.time.Instant;

import com.httn.codechay.member2.adminexam.enums.ExamType;

import jakarta.validation.constraints.*;

public class ExamUpsertRequest {
    @Size(min = 3, max = 255)
    @NotBlank
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private ExamType type;

    @Max(300)
    @Min(1)
    @NotNull
    private Integer durationMinutes;

    private Instant startTime;

    public ExamType getType() {
        return type;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getName() {
        return name;
    }
}
