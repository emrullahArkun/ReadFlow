package com.example.readflow.stats.domain.achievements;

import com.example.readflow.books.domain.Book;
import com.example.readflow.sessions.domain.ReadingSession;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
class SpeedReaderAchievementChecker implements AchievementChecker {

    private static final double SPEED_READ_PAGES_PER_DAY = 50.0;

    @Override
    public AchievementType type() {
        return AchievementType.SPEED_READER;
    }

    @Override
    public Achievement check(AchievementContext context) {
        for (ReadingSession session : context.sessions()) {
            Book book = session.getBook();
            if (book == null || !Boolean.TRUE.equals(book.getCompleted())
                    || book.getStartDate() == null || book.getPageCount() == null
                    || book.getPageCount() <= 0 || session.getEndTime() == null) {
                continue;
            }
            LocalDate completedDay = session.getEndTime().atZone(context.zoneId()).toLocalDate();
            long days = Math.max(1, ChronoUnit.DAYS.between(book.getStartDate(), completedDay));
            if ((double) book.getPageCount() / days >= SPEED_READ_PAGES_PER_DAY) {
                return AchievementCheckerSupport.unlocked(type(), true);
            }
        }
        return AchievementCheckerSupport.unlocked(type(), false);
    }
}
