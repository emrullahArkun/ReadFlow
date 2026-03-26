package com.example.readflow.stats.domain.achievements;

import org.springframework.stereotype.Component;

@Component
class EarlyBirdAchievementChecker implements AchievementChecker {

    private static final int FROM_HOUR = 5;
    private static final int TO_HOUR = 8;

    @Override
    public AchievementType type() {
        return AchievementType.EARLY_BIRD;
    }

    @Override
    public Achievement check(AchievementContext context) {
        return AchievementCheckerSupport.unlocked(
                type(),
                AchievementCheckerSupport.hasSessionInHourRange(context.sessions(), FROM_HOUR, TO_HOUR, context));
    }
}
