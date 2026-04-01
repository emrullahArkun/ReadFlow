package com.example.mybooktracker.discovery.application;

import com.example.mybooktracker.discovery.domain.BookDiscoveryProvider;
import com.example.mybooktracker.discovery.domain.DiscoveryBook;
import com.example.mybooktracker.discovery.domain.DiscoverySearchResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscoveryRecommendationServiceTest {

    @Mock
    private BookDiscoveryProvider discoveryProvider;

    @InjectMocks
    private DiscoveryRecommendationService recommendationService;

    @Test
    void getRecommendationsByAuthor_ShouldExcludeOwnedBooks() {
        DiscoveryBook owned = new DiscoveryBook("Owned", null, null, null, null, "isbn123", null);
        DiscoveryBook available = new DiscoveryBook("Free", null, null, null, null, "isbn456", null);
        when(discoveryProvider.getBooksByAuthor("Author", 5)).thenReturn(List.of(owned, available));

        var result = recommendationService.getRecommendationsByAuthor("Author", Set.of("isbn123"), 5);

        assertEquals(1, result.size());
        assertEquals("Free", result.get(0).title());
    }

    @Test
    void getRecommendationsByCategory_ShouldReturnBooks() {
        DiscoveryBook book = new DiscoveryBook("Cat Book", null, null, null, null, null, null);
        when(discoveryProvider.getBooksByCategory("Fiction", 5)).thenReturn(List.of(book));

        var result = recommendationService.getRecommendationsByCategory("Fiction", Set.of(), 5);

        assertEquals(1, result.size());
    }

    @Test
    void getRecommendationsByQuery_ShouldReturnBooks() {
        DiscoveryBook book = new DiscoveryBook("Query Book", null, null, null, null, null, null);
        when(discoveryProvider.getBooksByQuery("Java", 5)).thenReturn(List.of(book));

        var result = recommendationService.getRecommendationsByQuery("Java", Set.of(), 5);

        assertEquals(1, result.size());
    }

    @Test
    void searchBooks_ShouldFillRequestedPageAfterOwnedBooksAreFiltered() {
        DiscoveryBook owned = new DiscoveryBook("Owned", null, null, null, null, "owned-1", null);
        DiscoveryBook availableOne = new DiscoveryBook("Available 1", null, null, null, null, "free-1", null);
        DiscoveryBook availableTwo = new DiscoveryBook("Available 2", null, null, null, null, "free-2", null);
        DiscoveryBook availableThree = new DiscoveryBook("Available 3", null, null, null, null, "free-3", null);
        when(discoveryProvider.searchBooks("java", 0, 40))
                .thenReturn(new DiscoverySearchResult(List.of(owned, availableOne), 4));
        when(discoveryProvider.searchBooks("java", 2, 40))
                .thenReturn(new DiscoverySearchResult(List.of(availableTwo, availableThree), 4));

        DiscoverySearchResult result = recommendationService.searchBooks("java", Set.of("owned-1"), 0, 3);

        assertEquals(List.of("Available 1", "Available 2", "Available 3"),
                result.items().stream().map(DiscoveryBook::title).toList());
        assertEquals(3, result.totalItems());
    }

    @Test
    void searchBooks_ShouldUseFilteredOffsetForLaterPages() {
        DiscoveryBook owned = new DiscoveryBook("Owned", null, null, null, null, "owned-1", null);
        DiscoveryBook availableOne = new DiscoveryBook("Available 1", null, null, null, null, "free-1", null);
        DiscoveryBook availableTwo = new DiscoveryBook("Available 2", null, null, null, null, "free-2", null);
        DiscoveryBook availableThree = new DiscoveryBook("Available 3", null, null, null, null, "free-3", null);
        when(discoveryProvider.searchBooks("java", 0, 40))
                .thenReturn(new DiscoverySearchResult(List.of(owned, availableOne), 4));
        when(discoveryProvider.searchBooks("java", 2, 40))
                .thenReturn(new DiscoverySearchResult(List.of(availableTwo, availableThree), 4));

        DiscoverySearchResult result = recommendationService.searchBooks("java", Set.of("owned-1"), 1, 2);

        assertEquals(List.of("Available 2", "Available 3"),
                result.items().stream().map(DiscoveryBook::title).toList());
        assertEquals(3, result.totalItems());
        verify(discoveryProvider).searchBooks("java", 0, 40);
        verify(discoveryProvider).searchBooks("java", 2, 40);
    }
}
