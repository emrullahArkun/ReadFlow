package com.example.chapterflow.discovery.application;

import com.example.chapterflow.discovery.domain.DiscoveryBook;

import java.util.List;

public record AuthorRecommendations(
        List<String> authors,
        List<DiscoveryBook> books) {

    public AuthorRecommendations {
        authors = authors == null ? List.of() : List.copyOf(authors);
        books = books == null ? List.of() : List.copyOf(books);
    }
}
