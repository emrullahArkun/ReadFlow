package com.example.readflow.books.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReadingGoalPeriodCalculatorTest {

    private static final Instant FIXED_NOW = Instant.parse("2026-03-25T10:00:00Z");
    private static final Instant EXPECTED_WEEK_START = Instant.parse("2026-03-23T00:00:00Z");
    private static final Instant EXPECTED_MONTH_START = Instant.parse("2026-03-01T00:00:00Z");

    private ReadingGoalPeriodCalculator calculator;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        calculator = new ReadingGoalPeriodCalculator();
        fixedClock = Clock.fixed(FIXED_NOW, ZoneOffset.UTC);
    }

    @Test
    void getStartOfPeriod_ShouldReturnStartOfWeek_ForWeeklyGoal() {
        assertEquals(EXPECTED_WEEK_START, calculator.getStartOfPeriod(ReadingGoalType.WEEKLY, fixedClock));
    }

    @Test
    void getStartOfPeriod_ShouldReturnStartOfMonth_ForMonthlyGoal() {
        assertEquals(EXPECTED_MONTH_START, calculator.getStartOfPeriod(ReadingGoalType.MONTHLY, fixedClock));
    }
}
