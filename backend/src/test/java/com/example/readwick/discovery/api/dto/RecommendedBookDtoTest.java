package com.example.readwick.discovery.api.dto;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RecommendedBookDtoTest {

    @Test
    void constructor_ShouldDefaultNullCollectionsToEmptyLists() {
        RecommendedBookDto dto = new RecommendedBookDto(
                "Title",
                null,
                null,
                2024,
                321,
                "isbn",
                "cover");

        assertTrue(dto.authors().isEmpty());
        assertTrue(dto.categories().isEmpty());
    }

    @Test
    void constructor_ShouldCreateDefensiveCopiesForCollections() {
        List<String> authors = new ArrayList<>(List.of("Author"));
        List<String> categories = new ArrayList<>(List.of("Category"));

        RecommendedBookDto dto = new RecommendedBookDto(
                "Title",
                authors,
                categories,
                2024,
                321,
                "isbn",
                "cover");

        authors.add("Another");
        categories.add("Other");

        assertEquals(List.of("Author"), dto.authors());
        assertEquals(List.of("Category"), dto.categories());
        assertThrows(UnsupportedOperationException.class, () -> dto.authors().add("Fail"));
        assertThrows(UnsupportedOperationException.class, () -> dto.categories().add("Fail"));
    }
}
