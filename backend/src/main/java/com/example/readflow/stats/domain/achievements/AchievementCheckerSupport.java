package com.example.readflow.stats.domain.achievements;

import com.example.readflow.sessions.domain.ReadingSession;

import java.util.List;

final class AchievementCheckerSupport {

    private AchievementCheckerSupport() {
    }

    static Achievement unlocked(AchievementType type, boolean unlocked) {
        return new Achievement(type, unlocked, null);
    }

    static boolean hasSessionInHourRange(
            List<ReadingSession> sessions,
            int fromHour,
            int toHour,
            AchievementContext context) {
        for (ReadingSession session : sessions) {
            if (session.getStartTime() == null) {
                continue;
            }
            int hour = session.getStartTime().atZone(context.zoneId()).getHour();
            if (toHour > 24) {
                if (hour >= fromHour || hour < (toHour - 24)) {
                    return true;
                }
                continue;
            }
            if (hour >= fromHour && hour < toHour) {
                return true;
            }
        }
        return false;
    }
}
