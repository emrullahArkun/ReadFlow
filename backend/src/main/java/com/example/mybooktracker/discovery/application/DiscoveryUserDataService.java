package com.example.mybooktracker.discovery.application;

import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.books.application.BookQueryPort;
import com.example.mybooktracker.discovery.domain.DiscoverySnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class DiscoveryUserDataService {

    private final SearchHistoryService searchHistoryService;
    private final BookQueryPort bookQueryPort;

    @Cacheable(value = "ownedIsbns", key = "#user.id")
    Set<String> getOwnedIsbns(User user) {
        return Set.copyOf(bookQueryPort.findAllIsbnsByUser(user));
    }

    List<String> getTopAuthors(User user, int limit) {
        return bookQueryPort.findTopAuthorsByUser(user, limit);
    }

    List<String> getTopCategories(User user, int limit) {
        return bookQueryPort.findTopCategoriesByUser(user, limit);
    }

    List<String> getRecentSearches(User user, int limit) {
        return searchHistoryService.getRecentSearches(user, limit);
    }

    DiscoverySnapshot getSnapshot(User user, int recommendationLimit, int searchLimit) {
        return new DiscoverySnapshot(
                getOwnedIsbns(user),
                getTopAuthors(user, recommendationLimit),
                getTopCategories(user, recommendationLimit),
                getRecentSearches(user, searchLimit));
    }
}
