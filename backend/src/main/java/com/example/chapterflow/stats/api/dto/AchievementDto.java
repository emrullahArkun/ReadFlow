package com.example.chapterflow.stats.api.dto;

import com.example.chapterflow.stats.domain.achievements.AchievementType;

public record AchievementDto(
        AchievementType id,
        boolean unlocked,
        String unlockedDetail) {
}
