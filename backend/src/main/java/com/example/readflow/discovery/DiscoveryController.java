package com.example.readflow.discovery;

import com.example.readflow.auth.User;
import com.example.readflow.discovery.dto.DiscoveryResponse;
import com.example.readflow.discovery.dto.RecommendedBookDto;
import com.example.readflow.discovery.dto.SearchResultDto;
import com.example.readflow.shared.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_RESULTS = 10;

    private static <T> T pickRandom(List<T> list) {
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResultDto> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int startIndex,
            @RequestParam(defaultValue = "36") int maxResults,
            @CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);
        SearchResultDto result = discoveryService.searchBooks(q, ownedIsbns, startIndex, maxResults);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/search-log")
    public ResponseEntity<Void> logSearch(@RequestParam String query, @CurrentUser User user) {
        discoveryService.logSearch(query, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/authors")
    public ResponseEntity<DiscoveryResponse.AuthorSection> getAuthorRecommendations(@CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);
        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        String selectedAuthor = topAuthors.isEmpty() ? null : pickRandom(topAuthors);
        List<RecommendedBookDto> books = selectedAuthor == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(selectedAuthor, ownedIsbns, MAX_RESULTS);

        return ResponseEntity.ok(new DiscoveryResponse.AuthorSection(topAuthors, books));
    }

    @GetMapping("/categories")
    public ResponseEntity<DiscoveryResponse.CategorySection> getCategoryRecommendations(@CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);
        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        String selectedCategory = topCategories.isEmpty() ? null : pickRandom(topCategories);
        List<RecommendedBookDto> books = selectedCategory == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(selectedCategory, ownedIsbns, MAX_RESULTS);

        return ResponseEntity.ok(new DiscoveryResponse.CategorySection(topCategories, books));
    }

    @GetMapping("/recent-searches")
    public ResponseEntity<DiscoveryResponse.SearchSection> getRecentSearchRecommendations(@CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);
        List<String> recentSearches = discoveryService.getRecentSearches(user, DEFAULT_LIMIT);
        String selectedSearch = recentSearches.isEmpty() ? null : pickRandom(recentSearches);
        List<RecommendedBookDto> books = selectedSearch == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(selectedSearch, ownedIsbns, MAX_RESULTS);

        return ResponseEntity.ok(new DiscoveryResponse.SearchSection(recentSearches, books));
    }

    @GetMapping
    public ResponseEntity<DiscoveryResponse> getDiscoveryData(@CurrentUser User user) {
        Set<String> ownedIsbns = discoveryService.getOwnedIsbns(user);

        List<String> topAuthors = discoveryService.getTopAuthors(user, 3);
        String selectedAuthor = topAuthors.isEmpty() ? null : pickRandom(topAuthors);
        List<RecommendedBookDto> authorBooks = selectedAuthor == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByAuthor(selectedAuthor, ownedIsbns, MAX_RESULTS);
        var authorSection = new DiscoveryResponse.AuthorSection(topAuthors, authorBooks);

        List<String> topCategories = discoveryService.getTopCategories(user, 3);
        String selectedCategory = topCategories.isEmpty() ? null : pickRandom(topCategories);
        List<RecommendedBookDto> categoryBooks = selectedCategory == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByCategory(selectedCategory, ownedIsbns, MAX_RESULTS);
        var categorySection = new DiscoveryResponse.CategorySection(topCategories, categoryBooks);

        List<String> recentSearches = discoveryService.getRecentSearches(user, 3);
        String selectedSearch = recentSearches.isEmpty() ? null : pickRandom(recentSearches);
        List<RecommendedBookDto> searchBooks = selectedSearch == null
                ? Collections.emptyList()
                : discoveryService.getRecommendationsByQuery(selectedSearch, ownedIsbns, MAX_RESULTS);
        var searchSection = new DiscoveryResponse.SearchSection(recentSearches, searchBooks);

        return ResponseEntity.ok(new DiscoveryResponse(authorSection, categorySection, searchSection));
    }
}
