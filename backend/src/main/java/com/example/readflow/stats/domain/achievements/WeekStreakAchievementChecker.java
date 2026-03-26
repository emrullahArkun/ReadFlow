package com.example.readflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class WeekStreakAchievementChecker extends ThresholdAchievementChecker {

    @Override
    public AchievementType type() {
        return AchievementType.WEEK_STREAK;
    }

    @Override
    protected long actual(AchievementContext context) {
        return context.bestStreak();
    }

    @Override
    protected long threshold() {
        return 7;
    }

    @Override
    protected String unit() {
        return "days";
    }
}
