package com.example.readflow.stats.api;

import com.example.readflow.stats.api.dto.AchievementDto;
import com.example.readflow.stats.api.dto.DailyActivityDto;
import com.example.readflow.stats.api.dto.GenreStatDto;
import com.example.readflow.stats.api.dto.StatsOverviewDto;
import com.example.readflow.stats.application.DailyActivity;
import com.example.readflow.stats.application.GenreStat;
import com.example.readflow.stats.application.StatsOverview;
import com.example.readflow.stats.domain.achievements.Achievement;

import java.util.List;

final class StatsApiMapper {

    private StatsApiMapper() {
    }

    static StatsOverviewDto toDto(StatsOverview overview) {
        return new StatsOverviewDto(
                overview.totalBooks(),
                overview.completedBooks(),
                overview.totalPagesRead(),
                overview.totalReadingMinutes(),
                overview.currentStreak(),
                overview.longestStreak(),
                toGenreStatDtos(overview.genreDistribution()),
                toDailyActivityDtos(overview.dailyActivity()));
    }

    static AchievementDto toDto(Achievement achievement) {
        return new AchievementDto(
                achievement.id(),
                achievement.unlocked(),
                achievement.unlockedDetail());
    }

    static List<AchievementDto> toAchievementDtos(List<Achievement> achievements) {
        return achievements.stream()
                .map(StatsApiMapper::toDto)
                .toList();
    }

    private static List<GenreStatDto> toGenreStatDtos(List<GenreStat> genreStats) {
        return genreStats.stream()
                .map(genreStat -> new GenreStatDto(genreStat.genre(), genreStat.count()))
                .toList();
    }

    private static List<DailyActivityDto> toDailyActivityDtos(List<DailyActivity> dailyActivities) {
        return dailyActivities.stream()
                .map(dailyActivity -> new DailyActivityDto(dailyActivity.date(), dailyActivity.pagesRead()))
                .toList();
    }
}
