package com.example.readwick.discovery.infra.cache;

import com.example.readwick.books.domain.BookCollectionChangedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OwnedIsbnsCacheInvalidationListenerTest {

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private OwnedIsbnsCacheInvalidationListener listener;

    @Test
    void handleBookCollectionChanged_ShouldEvictOwnedIsbnsCacheEntry() {
        when(cacheManager.getCache("ownedIsbns")).thenReturn(cache);

        listener.handleBookCollectionChanged(new BookCollectionChangedEvent(42L));

        verify(cache).evict(42L);
    }

    @Test
    void handleBookCollectionChanged_ShouldIgnoreMissingCache() {
        when(cacheManager.getCache("ownedIsbns")).thenReturn(null);

        listener.handleBookCollectionChanged(new BookCollectionChangedEvent(42L));

        verifyNoInteractions(cache);
    }
}
