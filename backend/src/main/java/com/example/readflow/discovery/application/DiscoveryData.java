package com.example.readflow.discovery.application;

public record DiscoveryData(
        AuthorRecommendations byAuthor,
        CategoryRecommendations byCategory,
        SearchRecommendations bySearch) {
}
