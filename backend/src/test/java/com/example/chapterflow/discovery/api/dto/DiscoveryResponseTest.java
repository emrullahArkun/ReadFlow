package com.example.chapterflow.discovery.api.dto;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DiscoveryResponseTest {

    @Test
    void authorSection_ShouldHandleNulls() {
        DiscoveryResponse.AuthorSection section = new DiscoveryResponse.AuthorSection(null, null);
        assertNotNull(section.authors());
        assertTrue(section.authors().isEmpty());
        assertNotNull(section.books());
        assertTrue(section.books().isEmpty());
    }

    @Test
    void categorySection_ShouldHandleNulls() {
        DiscoveryResponse.CategorySection section = new DiscoveryResponse.CategorySection(null, null);
        assertNotNull(section.categories());
        assertTrue(section.categories().isEmpty());
        assertNotNull(section.books());
        assertTrue(section.books().isEmpty());
    }

    @Test
    void searchSection_ShouldHandleNulls() {
        DiscoveryResponse.SearchSection section = new DiscoveryResponse.SearchSection(null, null);
        assertNotNull(section.queries());
        assertTrue(section.queries().isEmpty());
        assertNotNull(section.books());
        assertTrue(section.books().isEmpty());
    }
}
