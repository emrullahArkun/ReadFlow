package com.example.readflow.books;

import com.example.readflow.sessions.ReadingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class ReadingGoalProgressCalculator {

    private final ReadingSessionRepository sessionRepository;

    public Integer calculateProgress(Book book) {
        if (book.getReadingGoalType() == null || book.getReadingGoalPages() == null) {
            return null;
        }

        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        LocalDateTime startOfPeriod;

        if (ReadingGoalType.WEEKLY == book.getReadingGoalType()) {
            LocalDate monday = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            startOfPeriod = monday.atStartOfDay();
        } else {
            startOfPeriod = now.withDayOfMonth(1).atStartOfDay();
        }

        Instant startInstant = startOfPeriod.atZone(ZoneOffset.UTC).toInstant();

        return sessionRepository.sumPagesReadByBookSince(book, startInstant);
    }
}
