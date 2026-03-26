package com.example.chapterflow.discovery.domain;

import java.util.List;

public record DiscoveryBook(
        String title,
        List<String> authors,
        List<String> categories,
        Integer publishYear,
        Integer pageCount,
        String isbn,
        String coverUrl) {

    public DiscoveryBook {
        authors = authors == null ? List.of() : List.copyOf(authors);
        categories = categories == null ? List.of() : List.copyOf(categories);
    }
}
