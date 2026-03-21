package com.httn.codechay.member3.dto;

import java.util.List;

public record ResultDetailResponse(
    String id,
    String examId,
    double score,
    int correct,
    int total,
    List<ResultAnswer> answers
) {}
