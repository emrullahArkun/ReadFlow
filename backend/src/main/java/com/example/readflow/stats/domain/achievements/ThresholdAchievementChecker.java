package com.example.readflow.stats.domain.achievements;

abstract class ThresholdAchievementChecker implements AchievementChecker {

    @Override
    public Achievement check(AchievementContext context) {
        long actual = actual(context);
        long threshold = threshold();
        boolean unlocked = actual >= threshold;
        String progress = unlocked ? actual + " " + unit() : actual + "/" + threshold;
        return new Achievement(type(), unlocked, progress);
    }

    protected abstract long actual(AchievementContext context);

    protected abstract long threshold();

    protected abstract String unit();
}
