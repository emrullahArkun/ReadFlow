package com.example.readflow.books.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateBookRequest(
        @NotBlank String isbn,
        @NotBlank String title,
        String authorName,
        @Min(1900) Integer publishYear,
        String coverUrl,
        Integer pageCount,
        List<@NotBlank String> categories) {
}
