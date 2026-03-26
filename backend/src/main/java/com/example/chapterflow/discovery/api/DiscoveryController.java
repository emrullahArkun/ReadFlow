package com.example.chapterflow.discovery.api;

import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.discovery.application.DiscoveryService;
import com.example.chapterflow.discovery.application.SearchHistoryService;
import com.example.chapterflow.discovery.api.dto.DiscoveryResponse;
import com.example.chapterflow.discovery.api.dto.SearchResultDto;
import com.example.chapterflow.shared.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final SearchHistoryService searchHistoryService;

    @GetMapping("/search")
    public ResponseEntity<SearchResultDto> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int startIndex,
            @RequestParam(defaultValue = "36") int maxResults,
            @CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);
        return ResponseEntity.ok(DiscoveryApiMapper.toDto(
                discoveryService.searchBooks(q, ownedIsbns, startIndex, maxResults)));
    }

    @PostMapping("/search-log")
    public ResponseEntity<Void> logSearch(@jakarta.validation.Valid @RequestBody com.example.chapterflow.discovery.api.dto.LogSearchRequest request, @CurrentUser User user) {
        searchHistoryService.logSearch(request.query(), user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/authors")
    public ResponseEntity<DiscoveryResponse.AuthorSection> getAuthorRecommendations(@CurrentUser User user) {
        return ResponseEntity.ok(DiscoveryApiMapper.toDto(discoveryService.getAuthorSection(user)));
    }

    @GetMapping("/categories")
    public ResponseEntity<DiscoveryResponse.CategorySection> getCategoryRecommendations(@CurrentUser User user) {
        return ResponseEntity.ok(DiscoveryApiMapper.toDto(discoveryService.getCategorySection(user)));
    }

    @GetMapping("/recent-searches")
    public ResponseEntity<DiscoveryResponse.SearchSection> getRecentSearchRecommendations(@CurrentUser User user) {
        return ResponseEntity.ok(DiscoveryApiMapper.toDto(discoveryService.getSearchSection(user)));
    }

    @GetMapping
    public ResponseEntity<DiscoveryResponse> getDiscoveryData(@CurrentUser User user) {
        return ResponseEntity.ok(DiscoveryApiMapper.toDto(discoveryService.getDiscoveryData(user)));
    }
}
