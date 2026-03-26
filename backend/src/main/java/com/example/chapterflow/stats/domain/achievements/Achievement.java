package com.example.chapterflow.stats.domain.achievements;

public record Achievement(
        AchievementType id,
        boolean unlocked,
        String unlockedDetail) {
}
