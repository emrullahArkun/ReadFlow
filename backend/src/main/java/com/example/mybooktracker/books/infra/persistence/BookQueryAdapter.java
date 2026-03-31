package com.example.mybooktracker.books.infra.persistence;

import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.books.application.BookQueryPort;
import com.example.mybooktracker.books.domain.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BookQueryAdapter implements BookQueryPort {

    private final BookRepository bookRepository;

    @Override
    public long countByUser(User user) {
        return bookRepository.countByUser(user);
    }

    @Override
    public long countCompletedByUser(User user) {
        return bookRepository.countByUserAndCompletedTrue(user);
    }

    @Override
    public List<String> findAllCategoriesByUser(User user) {
        return bookRepository.findAllCategoriesByUser(user);
    }

    @Override
    public List<String> findAllIsbnsByUser(User user) {
        return bookRepository.findAllIsbnsByUser(user);
    }

    @Override
    public List<String> findTopAuthorsByUser(User user, int limit) {
        return bookRepository.findTopAuthorsByUser(user, firstPage(limit));
    }

    @Override
    public List<String> findTopCategoriesByUser(User user, int limit) {
        return bookRepository.findTopCategoriesByUser(user, firstPage(limit));
    }

    @Override
    public Optional<Book> findByIdAndUser(Long id, User user) {
        return bookRepository.findByIdAndUser(id, user);
    }

    private PageRequest firstPage(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than zero");
        }
        return PageRequest.of(0, limit);
    }
}
