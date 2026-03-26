package com.example.readflow.books.application;

import com.example.readflow.books.domain.Book;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CreateBookCommandMapperTest {

    private CreateBookCommandMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CreateBookCommandMapperImpl();
    }

    @Test
    void toEntity_ShouldMapCommandToBook() {
        CreateBookCommand command = new CreateBookCommand(
                "isbn123", "Test Book", "John Doe", 2023, "http://cover.jpg", 300, List.of("Thriller"));

        Book book = mapper.toEntity(command);

        assertEquals("isbn123", book.getIsbn());
        assertEquals("Test Book", book.getTitle());
        assertEquals("John Doe", book.getAuthor());
        assertEquals(2023, book.getPublishYear());
        assertEquals("http://cover.jpg", book.getCoverUrl());
        assertEquals(300, book.getPageCount());
        assertEquals(List.of("Thriller"), book.getCategories());
        assertNull(book.getId());
        assertNull(book.getCurrentPage());
        assertNull(book.getUser());
    }
}
