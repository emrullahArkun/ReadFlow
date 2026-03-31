package com.example.mybooktracker.stats.domain.achievements;

public class NightOwlAchievementChecker implements AchievementChecker {

    // The helper treats values above 24 as a wrapped range, so 22-28 means 22:00 through 03:59.
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
