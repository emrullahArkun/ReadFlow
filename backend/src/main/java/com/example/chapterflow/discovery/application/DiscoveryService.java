package com.example.chapterflow.discovery.application;

import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.discovery.domain.DiscoveryBook;
import com.example.chapterflow.discovery.domain.DiscoverySearchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiscoveryService {

    private final DiscoveryUserDataService userDataService;
    private final DiscoveryRecommendationService recommendationService;
    private final DiscoverySectionsService discoverySectionsService;

    public Set<String> getOwnedIsbns(User user) {
        return userDataService.getOwnedIsbns(user);
    }

    List<String> getTopAuthors(User user, int limit) {
        return userDataService.getTopAuthors(user, limit);
    }

    List<String> getTopCategories(User user, int limit) {
        return userDataService.getTopCategories(user, limit);
    }

    List<DiscoveryBook> getRecommendationsByAuthor(String author, Set<String> ownedIsbns, int maxResults) {
        return recommendationService.getRecommendationsByAuthor(author, ownedIsbns, maxResults);
    }

    List<DiscoveryBook> getRecommendationsByCategory(String category, Set<String> ownedIsbns,
            int maxResults) {
        return recommendationService.getRecommendationsByCategory(category, ownedIsbns, maxResults);
    }

    List<DiscoveryBook> getRecommendationsByQuery(String query, Set<String> ownedIsbns, int maxResults) {
        return recommendationService.getRecommendationsByQuery(query, ownedIsbns, maxResults);
    }

    public DiscoverySearchResult searchBooks(String query, Set<String> ownedIsbns, int startIndex, int maxResults) {
        return recommendationService.searchBooks(query, ownedIsbns, startIndex, maxResults);
    }

    public AuthorRecommendations getAuthorSection(User user) {
        return discoverySectionsService.getAuthorSection(user);
    }

    public CategoryRecommendations getCategorySection(User user) {
        return discoverySectionsService.getCategorySection(user);
    }

    public SearchRecommendations getSearchSection(User user) {
        return discoverySectionsService.getSearchSection(user);
    }

    public DiscoveryData getDiscoveryData(User user) {
        return discoverySectionsService.getDiscoveryData(user);
    }
}
