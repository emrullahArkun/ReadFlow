package com.example.chapterflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class NightOwlAchievementChecker implements AchievementChecker {

    private static final int FROM_HOUR = 22;
    private static final int TO_HOUR = 28;

    @Override
    public AchievementType type() {
        return AchievementType.NIGHT_OWL;
    }

    @Override
    public Achievement check(AchievementContext context) {
        return AchievementCheckerSupport.unlocked(
                type(),
                AchievementCheckerSupport.hasSessionInHourRange(context.sessions(), FROM_HOUR, TO_HOUR, context));
    }
}
