package com.example.chapterflow.stats.application;

import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.shared.time.ZoneIdResolver;
import com.example.chapterflow.stats.domain.achievements.Achievement;
import com.example.chapterflow.stats.domain.achievements.AchievementChecker;
import com.example.chapterflow.stats.domain.achievements.AchievementContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AchievementService {

    private final AchievementContextFactory contextFactory;
    private final List<AchievementChecker> checkers;

    public AchievementService(AchievementContextFactory contextFactory, List<AchievementChecker> checkers) {
        this.contextFactory = contextFactory;
        this.checkers = checkers.stream()
                .sorted(Comparator.comparingInt(checker -> checker.type().ordinal()))
                .toList();
    }

    public List<Achievement> getAchievements(User user) {
        return getAchievements(user, (String) null);
    }

    public List<Achievement> getAchievements(User user, String timezone) {
        AchievementContext context = contextFactory.build(user, ZoneIdResolver.resolveOrUtc(timezone));
        return checkers.stream()
                .map(checker -> checker.check(context))
                .toList();
    }
}
