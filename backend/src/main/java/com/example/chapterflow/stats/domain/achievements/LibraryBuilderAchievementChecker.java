package com.example.chapterflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class LibraryBuilderAchievementChecker extends ThresholdAchievementChecker {

    @Override
    public AchievementType type() {
        return AchievementType.LIBRARY_BUILDER;
    }

    @Override
    protected long actual(AchievementContext context) {
        return context.totalBooks();
    }

    @Override
    protected long threshold() {
        return 10;
    }

    @Override
    protected String unit() {
        return "books";
    }
}
