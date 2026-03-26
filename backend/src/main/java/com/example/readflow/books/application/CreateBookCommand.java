package com.example.readflow.books.application;

import java.util.List;

public record CreateBookCommand(
        String isbn,
        String title,
        String authorName,
        Integer publishYear,
        String coverUrl,
        Integer pageCount,
        List<String> categories) {
}
