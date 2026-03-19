package com.httn.codechay.member2.adminexam.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class QuestionUpsertRequest {
    @Size(min = 1, max = 2000)
    @NotBlank
    private String text;

    @NotNull
    @Size(min = 4, max = 4)
    private List<@NotBlank @Size(max = 500) String> options;

    @NotNull
    @Min(0)
    @Max(3)
    private Integer correctOptionIndex;

    @Size(max = 1000)
    private String explanation;

    public Integer getCorrectOptionIndex() {
        return correctOptionIndex;
    }

    public String getExplanation() {
        return explanation;
    }

    public List<String> getOptions() {
        return options;
    }

    public String getText() {
        return text;
    }
}
