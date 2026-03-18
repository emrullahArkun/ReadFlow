package com.example.readflow.discovery.dto;

import java.util.List;

public record SearchResultDto(
        List<RecommendedBookDto> items,
        int totalItems) {
}
