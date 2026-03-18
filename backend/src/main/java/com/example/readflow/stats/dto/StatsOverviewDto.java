package com.example.readflow.stats.dto;

import java.util.List;

public record StatsOverviewDto(
        int totalBooks,
        int completedBooks,
        long totalPagesRead,
        long totalReadingMinutes,
        int currentStreak,
        int longestStreak,
        List<GenreStatDto> genreDistribution,
        List<DailyActivityDto> dailyActivity) {
}
