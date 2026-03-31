package com.example.mybooktracker.discovery.application;

import com.example.mybooktracker.auth.domain.User;
import com.example.mybooktracker.books.application.BookQueryPort;
import com.example.mybooktracker.discovery.domain.DiscoverySnapshot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscoveryUserDataServiceTest {

    @Mock
    private SearchHistoryService searchHistoryService;

    @Mock
    private BookQueryPort bookQueryPort;

    @InjectMocks
    private DiscoveryUserDataService userDataService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
    }

    @Test
    void getTopAuthors_ShouldReturnLimitedList() {
        when(bookQueryPort.findTopAuthorsByUser(user, 2)).thenReturn(List.of("A", "B"));

        List<String> result = userDataService.getTopAuthors(user, 2);

        assertEquals(2, result.size());
    }

    @Test
    void getTopCategories_ShouldReturnLimitedList() {
        when(bookQueryPort.findTopCategoriesByUser(user, 2)).thenReturn(List.of("Thriller", "Krimi"));

        List<String> result = userDataService.getTopCategories(user, 2);

        assertEquals(2, result.size());
    }

    @Test
    void getOwnedIsbns_ShouldReturnSet() {
        when(bookQueryPort.findAllIsbnsByUser(user)).thenReturn(List.of("isbn1", "isbn2"));

        Set<String> result = userDataService.getOwnedIsbns(user);

        assertEquals(2, result.size());
        assertTrue(result.contains("isbn1"));
    }

    @Test
    void getOwnedIsbns_ShouldReturnImmutableSet() {
        when(bookQueryPort.findAllIsbnsByUser(user)).thenReturn(List.of("isbn1", "isbn2"));

        Set<String> result = userDataService.getOwnedIsbns(user);

        assertThrows(UnsupportedOperationException.class, () -> result.add("isbn3"));
    }

    @Test
    void getSnapshot_ShouldCombineUserDiscoveryData() {
        when(bookQueryPort.findAllIsbnsByUser(user)).thenReturn(List.of("isbn1"));
        when(bookQueryPort.findTopAuthorsByUser(user, 3)).thenReturn(List.of("Author1"));
        when(bookQueryPort.findTopCategoriesByUser(user, 3)).thenReturn(List.of("Cat1"));
        when(searchHistoryService.getRecentSearches(user, 5)).thenReturn(List.of("query1"));

        DiscoverySnapshot snapshot = userDataService.getSnapshot(user, 3, 5);

        assertEquals(Set.of("isbn1"), snapshot.ownedIsbns());
        assertEquals(List.of("Author1"), snapshot.topAuthors());
        assertEquals(List.of("Cat1"), snapshot.topCategories());
        assertEquals(List.of("query1"), snapshot.recentSearches());
    }
}
