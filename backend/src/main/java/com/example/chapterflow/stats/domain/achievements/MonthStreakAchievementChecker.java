package com.example.chapterflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class MonthStreakAchievementChecker extends ThresholdAchievementChecker {

    @Override
    public AchievementType type() {
        return AchievementType.MONTH_STREAK;
    }

    @Override
    protected long actual(AchievementContext context) {
        return context.bestStreak();
    }

    @Override
    protected long threshold() {
        return 30;
    }

    @Override
    protected String unit() {
        return "days";
    }
}
