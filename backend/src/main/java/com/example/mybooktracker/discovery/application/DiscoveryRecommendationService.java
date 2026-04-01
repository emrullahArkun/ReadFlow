package com.example.mybooktracker.discovery.application;

import com.example.mybooktracker.discovery.domain.BookDiscoveryProvider;
import com.example.mybooktracker.discovery.domain.DiscoveryBook;
import com.example.mybooktracker.discovery.domain.DiscoverySearchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
        int safeStartIndex = Math.max(startIndex, 0);
        int safeMaxResults = Math.max(maxResults, 0);

        if (safeMaxResults == 0) {
            return new DiscoverySearchResult(List.of(), 0);
        }

        List<DiscoveryBook> pageItems = new ArrayList<>();
        int filteredSeen = 0;
        int providerOffset = 0;
        int providerTotal = Integer.MAX_VALUE;
        int batchSize = Math.max(safeMaxResults, 40);

        while (providerOffset < providerTotal) {
            DiscoverySearchResult result = discoveryProvider.searchBooks(query, providerOffset, batchSize);
            providerTotal = Math.max(result.totalItems(), 0);

            if (result.items().isEmpty()) {
                break;
            }

            for (DiscoveryBook book : filterOwnedBooks(result.items(), ownedIsbns)) {
                if (filteredSeen >= safeStartIndex && pageItems.size() < safeMaxResults) {
                    pageItems.add(book);
                }
                filteredSeen++;
            }

            providerOffset += result.items().size();
        }

        return new DiscoverySearchResult(pageItems, filteredSeen);
    }

    private List<DiscoveryBook> filterOwnedBooks(List<DiscoveryBook> books, Set<String> ownedIsbns) {
        return books.stream()
                .filter(book -> book.isbn() == null || !ownedIsbns.contains(book.isbn()))
                .toList();
    }
}
