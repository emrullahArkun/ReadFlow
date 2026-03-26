package com.example.readflow.discovery.api;

import com.example.readflow.discovery.api.dto.DiscoveryResponse;
import com.example.readflow.discovery.api.dto.RecommendedBookDto;
import com.example.readflow.discovery.api.dto.SearchResultDto;
import com.example.readflow.discovery.application.AuthorRecommendations;
import com.example.readflow.discovery.application.CategoryRecommendations;
import com.example.readflow.discovery.application.DiscoveryData;
import com.example.readflow.discovery.application.SearchRecommendations;
import com.example.readflow.discovery.domain.DiscoveryBook;
import com.example.readflow.discovery.domain.DiscoverySearchResult;

import java.util.List;

final class DiscoveryApiMapper {

    private DiscoveryApiMapper() {
    }

    static SearchResultDto toDto(DiscoverySearchResult result) {
        return new SearchResultDto(toBookDtos(result.items()), result.totalItems());
    }

    static DiscoveryResponse.AuthorSection toDto(AuthorRecommendations section) {
        return new DiscoveryResponse.AuthorSection(section.authors(), toBookDtos(section.books()));
    }

    static DiscoveryResponse.CategorySection toDto(CategoryRecommendations section) {
        return new DiscoveryResponse.CategorySection(section.categories(), toBookDtos(section.books()));
    }

    static DiscoveryResponse.SearchSection toDto(SearchRecommendations section) {
        return new DiscoveryResponse.SearchSection(section.queries(), toBookDtos(section.books()));
    }

    static DiscoveryResponse toDto(DiscoveryData data) {
        return new DiscoveryResponse(
                toDto(data.byAuthor()),
                toDto(data.byCategory()),
                toDto(data.bySearch()));
    }

    private static List<RecommendedBookDto> toBookDtos(List<DiscoveryBook> books) {
        return books.stream()
                .map(DiscoveryApiMapper::toDto)
                .toList();
    }

    private static RecommendedBookDto toDto(DiscoveryBook book) {
        return new RecommendedBookDto(
                book.title(),
                book.authors(),
                book.categories(),
                book.publishYear(),
                book.pageCount(),
                book.isbn(),
                book.coverUrl());
    }
}
