package com.example.chapterflow.discovery.application;

public record DiscoveryData(
        AuthorRecommendations byAuthor,
        CategoryRecommendations byCategory,
        SearchRecommendations bySearch) {
}
