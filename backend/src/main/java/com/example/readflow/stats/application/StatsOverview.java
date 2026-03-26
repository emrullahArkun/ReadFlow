package com.example.readflow.stats.application;

import java.util.List;

public record StatsOverview(
        long totalBooks,
        long completedBooks,
        long totalPagesRead,
        long totalReadingMinutes,
        int currentStreak,
        int longestStreak,
        List<GenreStat> genreDistribution,
        List<DailyActivity> dailyActivity) {

    public StatsOverview {
        genreDistribution = genreDistribution == null ? List.of() : List.copyOf(genreDistribution);
        dailyActivity = dailyActivity == null ? List.of() : List.copyOf(dailyActivity);
    }
}
