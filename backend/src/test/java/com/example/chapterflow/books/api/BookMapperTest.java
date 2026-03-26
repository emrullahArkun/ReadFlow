package com.example.chapterflow.books.api;

import com.example.chapterflow.books.api.dto.BookDto;
import com.example.chapterflow.books.domain.Book;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookMapperTest {

    private BookMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new BookMapperImpl();
    }

    // --- toDto tests ---

    @Test
    void toDto_ShouldMapAllFields() {
        Book book = createBook();
        book.setAuthor("John Doe");
        book.setCategories(List.of("Fiction", "Thriller"));

        BookDto dto = mapper.toDto(book);

        assertEquals(1L, dto.id());
        assertEquals("isbn123", dto.isbn());
        assertEquals("Test Book", dto.title());
        assertEquals("John Doe", dto.authorName());
        assertEquals(2023, dto.publishYear());
        assertEquals("http://cover.jpg", dto.coverUrl());
        assertEquals(300, dto.pageCount());
        assertEquals(50, dto.currentPage());
        assertEquals(List.of("Fiction", "Thriller"), dto.categories());
        assertNull(dto.readingGoalProgress()); // Progress is set separately, not by mapper
    }

    @Test
    void toDto_ShouldHandleNullFields() {
        Book book = new Book();
        book.setId(1L);
        book.setIsbn("isbn");
        book.setTitle("title");

        BookDto dto = mapper.toDto(book);

        assertEquals(1L, dto.id());
        assertNull(dto.authorName());
        assertNull(dto.coverUrl());
        assertTrue(dto.categories().isEmpty());
        assertNull(dto.readingGoalType());
        assertNull(dto.readingGoalProgress());
    }

    // --- Helper ---

    private Book createBook() {
        Book book = new Book();
        book.setId(1L);
        book.setIsbn("isbn123");
        book.setTitle("Test Book");
        book.setPublishYear(2023);
        book.setCoverUrl("http://cover.jpg");
        book.setPageCount(300);
        book.setCurrentPage(50);
        return book;
    }
}
