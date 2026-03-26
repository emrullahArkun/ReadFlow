package com.example.chapterflow.stats.application;

import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.books.infra.persistence.BookRepository;
import com.example.chapterflow.sessions.infra.persistence.ReadingSessionRepository;
import com.example.chapterflow.sessions.domain.ReadingSession;
import com.example.chapterflow.sessions.domain.SessionStatus;
import com.example.chapterflow.stats.domain.activity.SessionAnalyzer;
import com.example.chapterflow.stats.domain.achievements.AchievementContext;
import com.example.chapterflow.stats.domain.streak.StreakInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AchievementContextFactory {

    private final BookRepository bookRepository;
    private final ReadingSessionRepository sessionRepository;
    private final StreakService streakService;
    private final Clock clock;

    public AchievementContext build(User user, ZoneId zoneId) {
        long totalBooks = bookRepository.countByUser(user);
        long completedBooks = bookRepository.countByUserAndCompletedTrue(user);
        long totalPages = sessionRepository.sumPagesReadByUser(user, SessionStatus.COMPLETED);
        long totalSessions = sessionRepository.countCompletedByUser(user, SessionStatus.COMPLETED);
        StreakInfo streakInfo = streakService.calculateStreaks(user, zoneId);
        int bestStreak = streakInfo.longest();

        Instant since = LocalDate.now(clock.withZone(zoneId)).minusYears(1).atStartOfDay(zoneId).toInstant();
        List<ReadingSession> sessions = sessionRepository.findCompletedSessionsSince(user, since, SessionStatus.COMPLETED);
        Map<java.time.LocalDate, Integer> dailyPagesMap = SessionAnalyzer.getDailyPagesMap(sessions, zoneId);
        int maxDailyPages = dailyPagesMap.values().stream()
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);

        return new AchievementContext(
                totalBooks,
                completedBooks,
                totalPages,
                totalSessions,
                maxDailyPages,
                bestStreak,
                zoneId,
                sessions);
    }
}
