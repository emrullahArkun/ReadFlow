package com.example.readflow.stats.domain.achievements;

// Strategy pattern: each achievement rule lives in its own interchangeable checker.
public interface AchievementChecker {

    AchievementType type();

    Achievement check(AchievementContext context);
}
