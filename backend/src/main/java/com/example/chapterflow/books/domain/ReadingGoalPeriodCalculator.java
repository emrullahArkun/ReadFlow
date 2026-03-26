package com.example.chapterflow.books.domain;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Component
public class ReadingGoalPeriodCalculator {

    public Instant getStartOfPeriod(ReadingGoalType goalType, Clock clock) {
        LocalDate now = LocalDate.now(clock);
        return switch (goalType) {
            case WEEKLY -> now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .atStartOfDay(clock.getZone())
                    .toInstant();
            case MONTHLY -> now.withDayOfMonth(1)
                    .atStartOfDay(clock.getZone())
                    .toInstant();
        };
    }
}
