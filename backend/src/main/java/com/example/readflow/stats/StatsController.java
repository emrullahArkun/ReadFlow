package com.example.readflow.stats;

import com.example.readflow.auth.User;
import com.example.readflow.shared.security.CurrentUser;
import com.example.readflow.stats.dto.AchievementDto;
import com.example.readflow.stats.dto.StatsOverviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/overview")
    public ResponseEntity<StatsOverviewDto> getOverview(@CurrentUser User user) {
        return ResponseEntity.ok(statsService.getOverview(user));
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<AchievementDto>> getAchievements(@CurrentUser User user) {
        return ResponseEntity.ok(statsService.getAchievements(user));
    }
}
