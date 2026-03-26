package com.example.chapterflow.books.application;

import com.example.chapterflow.books.domain.Book;
import com.example.chapterflow.books.domain.ReadingGoalPeriodCalculator;
import com.example.chapterflow.books.domain.ReadingGoalType;
import com.example.chapterflow.sessions.domain.SessionStatus;
import com.example.chapterflow.sessions.infra.persistence.ReadingSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReadingGoalProgressService {

    private final ReadingSessionRepository sessionRepository;
    private final Clock clock;
    private final ReadingGoalPeriodCalculator readingGoalPeriodCalculator;

    public Integer calculateProgress(Book book) {
        if (book.getReadingGoalType() == null || book.getReadingGoalPages() == null) {
            return null;
        }

        Instant startInstant = readingGoalPeriodCalculator.getStartOfPeriod(book.getReadingGoalType(), clock);
        return sessionRepository.sumPagesReadByBookSince(book, startInstant, SessionStatus.COMPLETED);
    }

    public Map<Long, Integer> calculateProgressBatch(List<Book> books) {
        Map<Long, Integer> result = new HashMap<>();

        List<Book> weeklyBooks = books.stream()
                .filter(b -> b.getReadingGoalType() == ReadingGoalType.WEEKLY && b.getReadingGoalPages() != null)
                .toList();

        List<Book> monthlyBooks = books.stream()
                .filter(b -> b.getReadingGoalType() == ReadingGoalType.MONTHLY && b.getReadingGoalPages() != null)
                .toList();

        if (!weeklyBooks.isEmpty()) {
            Instant weekStart = readingGoalPeriodCalculator.getStartOfPeriod(ReadingGoalType.WEEKLY, clock);
            for (var row : sessionRepository.sumPagesReadByBooksSince(weeklyBooks, weekStart, SessionStatus.COMPLETED)) {
                result.put(row.getBookId(), row.getTotalPages());
            }
            // Books with goals but no sessions yet get 0
            for (Book book : weeklyBooks) {
                result.putIfAbsent(book.getId(), 0);
            }
        }

        if (!monthlyBooks.isEmpty()) {
            Instant monthStart = readingGoalPeriodCalculator.getStartOfPeriod(ReadingGoalType.MONTHLY, clock);
            for (var row : sessionRepository.sumPagesReadByBooksSince(monthlyBooks, monthStart, SessionStatus.COMPLETED)) {
                result.put(row.getBookId(), row.getTotalPages());
            }
            for (Book book : monthlyBooks) {
                result.putIfAbsent(book.getId(), 0);
            }
        }

        return result;
    }
}
