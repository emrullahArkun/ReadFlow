package com.example.readflow.books.dto;

import java.time.LocalDate;
import java.util.List;

public record BookDto(
                Long id,
                String isbn,
                String title,
                String authorName,
                Integer publishYear,
                String coverUrl,
                Integer pageCount,
                Integer currentPage,
                LocalDate startDate,
                Boolean completed,
                String readingGoalType,
                Integer readingGoalPages,
                Integer readingGoalProgress,
                List<String> categories) {
}
