package com.httn.codechay.member3.dto;

public record ResultAnswer(
    String questionId,
    int selectedOptionIndex,
    int correctOptionIndex,
    boolean isCorrect,
    String explanation
) {}
