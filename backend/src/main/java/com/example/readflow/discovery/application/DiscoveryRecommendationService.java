package com.example.readflow.discovery.application;

import com.example.readflow.discovery.domain.BookDiscoveryProvider;
import com.example.readflow.discovery.domain.DiscoveryBook;
import com.example.readflow.discovery.domain.DiscoverySearchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
class DiscoveryRecommendationService {

    private final BookDiscoveryProvider discoveryProvider;

    List<DiscoveryBook> getRecommendationsByAuthor(String author, Set<String> ownedIsbns, int maxResults) {
        return filterOwnedBooks(discoveryProvider.getBooksByAuthor(author, maxResults), ownedIsbns);
    }

    List<DiscoveryBook> getRecommendationsByCategory(String category, Set<String> ownedIsbns, int maxResults) {
        return filterOwnedBooks(discoveryProvider.getBooksByCategory(category, maxResults), ownedIsbns);
    }

    List<DiscoveryBook> getRecommendationsByQuery(String query, Set<String> ownedIsbns, int maxResults) {
        return filterOwnedBooks(discoveryProvider.getBooksByQuery(query, maxResults), ownedIsbns);
    }

    DiscoverySearchResult searchBooks(String query, Set<String> ownedIsbns, int startIndex, int maxResults) {
        DiscoverySearchResult result = discoveryProvider.searchBooks(query, startIndex, maxResults);
        List<DiscoveryBook> filtered = filterOwnedBooks(result.items(), ownedIsbns);
        return new DiscoverySearchResult(filtered, filtered.size());
    }

    private List<DiscoveryBook> filterOwnedBooks(List<DiscoveryBook> books, Set<String> ownedIsbns) {
        return books.stream()
                .filter(book -> book.isbn() == null || !ownedIsbns.contains(book.isbn()))
                .toList();
    }
}
