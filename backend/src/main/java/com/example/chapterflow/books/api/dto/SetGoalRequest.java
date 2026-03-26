package com.example.chapterflow.books.api.dto;

import com.example.chapterflow.books.domain.ReadingGoalType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SetGoalRequest(
                @NotNull(message = "Type must not be null") ReadingGoalType type,

                @NotNull(message = "Pages are required")
                @Min(value = 1, message = "Pages must be at least 1") Integer pages) {
}
