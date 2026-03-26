package com.example.chapterflow.discovery.domain;

import java.util.List;

public record DiscoverySearchResult(
        List<DiscoveryBook> items,
        int totalItems) {

    public DiscoverySearchResult {
        items = items == null ? List.of() : List.copyOf(items);
    }
}
