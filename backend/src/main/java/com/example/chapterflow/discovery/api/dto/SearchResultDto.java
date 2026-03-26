package com.example.chapterflow.discovery.api.dto;

import java.util.List;

public record SearchResultDto(
        List<RecommendedBookDto> items,
        int totalItems) {
}
