package com.example.mybooktracker.books.infra.persistence;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class BookQueryAdapterTest {

    private final BookQueryAdapter adapter = new BookQueryAdapter(mock(BookRepository.class));

    @Test
    void findTopAuthorsByUser_ShouldThrow_WhenLimitIsNotPositive() {
        assertThrows(IllegalArgumentException.class, () -> adapter.findTopAuthorsByUser(null, 0));
    }

    @Test
    void findTopCategoriesByUser_ShouldThrow_WhenLimitIsNegative() {
        assertThrows(IllegalArgumentException.class, () -> adapter.findTopCategoriesByUser(null, -1));
    }
}
