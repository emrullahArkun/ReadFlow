package com.example.chapterflow.sessions.api.dto;

import com.example.chapterflow.sessions.domain.SessionStatus;

import java.time.Instant;

public record ReadingSessionDto(
                Long id,
                Long bookId,
                Instant startTime,
                Instant endTime,
                SessionStatus status,
                Integer startPage,
                Integer endPage,
                Integer pagesRead,
                Long pausedMillis,
                Instant pausedAt) {
}
