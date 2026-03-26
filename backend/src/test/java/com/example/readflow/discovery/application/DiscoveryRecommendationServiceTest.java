package com.example.readflow.discovery.application;

import com.example.readflow.discovery.domain.BookDiscoveryProvider;
import com.example.readflow.discovery.domain.DiscoveryBook;
import com.example.readflow.discovery.domain.DiscoverySearchResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
    void searchBooks_ShouldReturnFilteredItemsAndMatchingTotal() {
        DiscoveryBook owned = new DiscoveryBook("Owned", null, null, null, null, "owned-1", null);
        DiscoveryBook available = new DiscoveryBook("Available", null, null, null, null, "free-1", null);
        when(discoveryProvider.searchBooks("java", 0, 10))
                .thenReturn(new DiscoverySearchResult(List.of(owned, available), 99));

        DiscoverySearchResult result = recommendationService.searchBooks("java", Set.of("owned-1"), 0, 10);

        assertEquals(1, result.items().size());
        assertEquals("Available", result.items().get(0).title());
        assertEquals(1, result.totalItems());
    }
}
