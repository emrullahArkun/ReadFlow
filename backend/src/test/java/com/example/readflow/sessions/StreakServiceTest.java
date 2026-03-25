package com.example.readflow.sessions;

import com.example.readflow.auth.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StreakServiceTest {

    @Mock
    private ReadingSessionRepository sessionRepository;

    @InjectMocks
    private StreakService streakService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
    }

    @Test
    void calculateStreaks_ShouldReturnZeros_WhenNoReadingDays() {
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(Collections.emptyList());

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(0, result.current());
        assertEquals(0, result.longest());
    }

    @Test
    void calculateStreaks_ShouldCountConsecutiveDays_IncludingToday() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(1).atStartOfDay(ZoneOffset.UTC).plusHours(14).toInstant(),
                        today.minusDays(2).atStartOfDay(ZoneOffset.UTC).plusHours(8).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(3, result.current());
        assertEquals(3, result.longest());
    }

    @Test
    void calculateStreaks_ShouldCountFromYesterday_WhenNoSessionToday() {
        LocalDate yesterday = LocalDate.now(ZoneOffset.UTC).minusDays(1);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        yesterday.atStartOfDay(ZoneOffset.UTC).plusHours(20).toInstant(),
                        yesterday.minusDays(1).atStartOfDay(ZoneOffset.UTC).plusHours(15).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(2, result.current());
        assertEquals(2, result.longest());
    }

    @Test
    void calculateStreaks_ShouldBreakCurrentOnGap() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(1).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(3).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(2, result.current());
        assertEquals(2, result.longest());
    }

    @Test
    void calculateStreaks_ShouldReturnZeroCurrent_WhenLastReadingWasTwoDaysAgo() {
        LocalDate twoDaysAgo = LocalDate.now(ZoneOffset.UTC).minusDays(2);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        twoDaysAgo.atStartOfDay(ZoneOffset.UTC).plusHours(12).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(0, result.current());
        assertEquals(1, result.longest());
    }

    @Test
    void calculateStreaks_ShouldFindLongestConsecutiveRun() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(1).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(5).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(6).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.minusDays(7).atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(2, result.current());
        assertEquals(3, result.longest());
    }

    @Test
    void calculateStreaks_ShouldReturnOneForBoth_WhenSingleDayToday() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(18).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(1, result.current());
        assertEquals(1, result.longest());
    }

    @Test
    void calculateStreaks_ShouldRespectUserTimezone() {
        // Session ended at 23:30 UTC — in UTC that's still the same day,
        // but in UTC+2 (Europe/Berlin in summer) it's already the next day (01:30)
        ZoneId berlin = ZoneId.of("Europe/Berlin");
        LocalDate todayBerlin = LocalDate.now(berlin);

        // Two sessions that are on consecutive Berlin dates
        Instant lateEvening = todayBerlin.minusDays(1).atStartOfDay(berlin).plusHours(23).plusMinutes(30)
                .toInstant();
        Instant earlyMorning = todayBerlin.atStartOfDay(berlin).plusHours(1).plusMinutes(30)
                .toInstant();

        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(lateEvening, earlyMorning));

        // In Berlin timezone: these should be two consecutive days
        StreakService.StreakInfo berlinResult = streakService.calculateStreaks(user, berlin);
        assertEquals(2, berlinResult.current());
    }

    @Test
    void calculateStreaks_ShouldDeduplicateMultipleSessionsSameDay() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant(),
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(14).toInstant(),
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(20).toInstant()
                ));

        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(1, result.current());
        assertEquals(1, result.longest());
    }

    @Test
    void calculateStreaks_ShouldFallbackToUtc_WhenNoTimezoneProvided() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        when(sessionRepository.findAllCompletedEndTimes(eq(user), eq(SessionStatus.COMPLETED)))
                .thenReturn(List.of(
                        today.atStartOfDay(ZoneOffset.UTC).plusHours(10).toInstant()
                ));

        // No-arg overload should use UTC
        StreakService.StreakInfo result = streakService.calculateStreaks(user);
        assertEquals(1, result.current());
        assertEquals(1, result.longest());
    }
}
