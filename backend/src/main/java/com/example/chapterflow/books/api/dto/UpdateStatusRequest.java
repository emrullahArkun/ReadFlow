package com.example.chapterflow.books.api.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Completed status is required") Boolean completed) {
}
