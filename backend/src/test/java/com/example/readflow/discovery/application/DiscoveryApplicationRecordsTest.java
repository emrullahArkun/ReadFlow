package com.example.readflow.discovery.application;

import com.example.readflow.discovery.domain.DiscoveryBook;
import com.example.readflow.discovery.domain.DiscoverySearchResult;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DiscoveryApplicationRecordsTest {

    @Test
    void recommendationRecords_ShouldNormalizeNullListsToEmpty() {
        AuthorRecommendations authorRecommendations = new AuthorRecommendations(null, null);
        CategoryRecommendations categoryRecommendations = new CategoryRecommendations(null, null);
        SearchRecommendations searchRecommendations = new SearchRecommendations(null, null);
        DiscoverySearchResult searchResult = new DiscoverySearchResult(null, 5);

        assertTrue(authorRecommendations.authors().isEmpty());
        assertTrue(authorRecommendations.books().isEmpty());
        assertTrue(categoryRecommendations.categories().isEmpty());
        assertTrue(categoryRecommendations.books().isEmpty());
        assertTrue(searchRecommendations.queries().isEmpty());
        assertTrue(searchRecommendations.books().isEmpty());
        assertTrue(searchResult.items().isEmpty());
        assertEquals(5, searchResult.totalItems());
    }

    @Test
    void recommendationRecords_ShouldDefensivelyCopyLists() {
        DiscoveryBook book = new DiscoveryBook("Title", List.of("Author"), List.of("Category"), 2025, 123, "isbn", "cover");

        List<String> authors = new ArrayList<>(List.of("Author"));
        List<String> categories = new ArrayList<>(List.of("Category"));
        List<String> queries = new ArrayList<>(List.of("query"));
        List<DiscoveryBook> books = new ArrayList<>(List.of(book));

        AuthorRecommendations authorRecommendations = new AuthorRecommendations(authors, books);
        CategoryRecommendations categoryRecommendations = new CategoryRecommendations(categories, books);
        SearchRecommendations searchRecommendations = new SearchRecommendations(queries, books);
        DiscoverySearchResult searchResult = new DiscoverySearchResult(books, 1);

        authors.add("Another");
        categories.add("Another");
        queries.add("another");
        books.add(book);

        assertEquals(List.of("Author"), authorRecommendations.authors());
        assertEquals(List.of("Category"), categoryRecommendations.categories());
        assertEquals(List.of("query"), searchRecommendations.queries());
        assertEquals(1, authorRecommendations.books().size());
        assertEquals(1, categoryRecommendations.books().size());
        assertEquals(1, searchRecommendations.books().size());
        assertEquals(1, searchResult.items().size());

        assertThrows(UnsupportedOperationException.class, () -> authorRecommendations.authors().add("fail"));
        assertThrows(UnsupportedOperationException.class, () -> categoryRecommendations.categories().add("fail"));
        assertThrows(UnsupportedOperationException.class, () -> searchRecommendations.queries().add("fail"));
        assertThrows(UnsupportedOperationException.class, () -> searchResult.items().add(book));
    }
}
