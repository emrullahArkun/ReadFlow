package com.example.mybooktracker.books.domain;

import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.sessions.domain.ReadingSession;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
// A user cannot have duplicate books with the same ISBN
@Table(name = "books", indexes = {
        @Index(name = "idx_book_user", columnList = "user_id"),
        @Index(name = "idx_book_isbn", columnList = "isbn")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "isbn" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String isbn;
    private String title;

    private String author;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer publishYear;
    private String coverUrl;

    private Integer pageCount;
    private Integer currentPage;
    private LocalDate startDate;
    private Boolean completed;

    @Enumerated(EnumType.STRING)
    private ReadingGoalType readingGoalType;
    private Integer readingGoalPages;

    @ElementCollection
    @CollectionTable(name = "book_categories", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "category")
    private List<String> categories = new ArrayList<>();

    // Deleting a book cascades to all its reading sessions
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReadingSession> readingSessions = new ArrayList<>();

    // Helper methods to keep both sides of the bidirectional relationship in sync
    public void addReadingSession(ReadingSession session) {
        readingSessions.add(session);
        session.setBook(this);
    }

    public void removeReadingSession(ReadingSession session) {
        readingSessions.remove(session);
        session.setBook(null);
    }

    public void assignToUser(User user) {
        this.user = user;
    }

    public void replaceCategories(List<String> categories) {
        this.categories = categories == null ? new ArrayList<>() : new ArrayList<>(categories);
    }

    public void updateReadingGoal(ReadingGoalType type, Integer pages) {
        if (type == null && pages != null) {
            throw new IllegalArgumentException("Reading goal pages require a reading goal type");
        }
        if (pages != null && pages <= 0) {
            throw new IllegalArgumentException("Reading goal pages must be positive");
        }

        this.readingGoalType = type;
        this.readingGoalPages = pages;
    }

    public void initializeTracking(LocalDate today) {
        if (this.currentPage == null) {
            this.currentPage = 0;
        }
        if (this.startDate == null) {
            this.startDate = today;
        }
        if (this.completed == null) {
            this.completed = false;
        }
    }

    public void updateProgress(Integer newPage) {
        if (newPage == null) {
            throw new IllegalArgumentException("Current page is required");
        }
        if (newPage < 0) {
            throw new IllegalArgumentException("Current page cannot be negative");
        }
        if (this.pageCount != null && newPage > this.pageCount) {
            throw new IllegalArgumentException("Current page cannot exceed total page count");
        }

        this.currentPage = newPage;

        if (this.pageCount != null) {
            this.completed = (newPage >= this.pageCount);
        }
    }

    public void updateStatus(Boolean completed) {
        this.completed = completed;

        if (Boolean.TRUE.equals(completed) && this.pageCount != null) {
            this.currentPage = this.pageCount;
        }
    }

    // Set sensible defaults before first save
    @PrePersist
    public void prePersist() {
        initializeTracking(null);
    }
}
