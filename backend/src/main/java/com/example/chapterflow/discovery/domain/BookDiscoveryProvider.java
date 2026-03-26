package com.example.chapterflow.discovery.domain;

import java.util.List;

// Adapter pattern: discovery depends on this provider interface instead of a provider-specific HTTP client.
public interface BookDiscoveryProvider {

    List<DiscoveryBook> getBooksByAuthor(String author, int maxResults);

    List<DiscoveryBook> getBooksByCategory(String category, int maxResults);

    List<DiscoveryBook> getBooksByQuery(String query, int maxResults);

    DiscoverySearchResult searchBooks(String query, int offset, int limit);
}
