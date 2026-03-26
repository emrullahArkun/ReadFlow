package com.example.chapterflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class MarathonAchievementChecker extends ThresholdAchievementChecker {

    @Override
    public AchievementType type() {
        return AchievementType.MARATHON;
    }

    @Override
    protected long actual(AchievementContext context) {
        return context.maxDailyPages();
    }

    @Override
    protected long threshold() {
        return 100;
    }

    @Override
    protected String unit() {
        return "pages";
    }
}
