package com.example.readflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class BookwormAchievementChecker extends ThresholdAchievementChecker {

    @Override
    public AchievementType type() {
        return AchievementType.BOOKWORM;
    }

    @Override
    protected long actual(AchievementContext context) {
        return context.completedBooks();
    }

    @Override
    protected long threshold() {
        return 5;
    }

    @Override
    protected String unit() {
        return "books";
    }
}
