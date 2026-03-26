package com.example.chapterflow.sessions.api.dto;

import java.time.Instant;
import jakarta.validation.constraints.Min;

public record StopSessionRequest(
        Instant endTime,
        @Min(value = 0, message = "End page cannot be negative") Integer endPage) {
}
