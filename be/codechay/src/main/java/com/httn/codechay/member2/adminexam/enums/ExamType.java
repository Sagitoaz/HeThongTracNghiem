package com.httn.codechay.member2.adminexam.enums;

import java.util.Locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ExamType {
    FREE,
    SCHEDULED;

    @JsonCreator
    public static ExamType fromJson(String value) {
        if (value == null) {
            return null;
        }
        return ExamType.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    @JsonValue
    public String toJson() {
        return name().toLowerCase(Locale.ROOT);
    }
}
