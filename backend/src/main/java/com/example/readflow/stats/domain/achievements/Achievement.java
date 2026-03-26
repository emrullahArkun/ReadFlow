package com.example.readflow.stats.domain.achievements;

public record Achievement(
        AchievementType id,
        boolean unlocked,
        String unlockedDetail) {
}
