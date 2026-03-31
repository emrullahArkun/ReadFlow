package com.example.mybooktracker.discovery.infra.external;

import com.example.mybooktracker.discovery.domain.DiscoverySearchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GoogleBooksClientTest {

    private GoogleBooksClient googleBooksClient;
    private MockRestServiceServer mockServer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        googleBooksClient = new GoogleBooksClient(builder, "https://www.googleapis.com/books/v1", "test-key");
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JacksonException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, Object> imageLinks(String thumbnail) {
        return Map.of("thumbnail", thumbnail);
    }

    private Map<String, Object> volume(String title, String thumbnail) {
        return Map.of(
                "volumeInfo", Map.of(
                        "title", title,
                        "authors", List.of("Author"),
                        "imageLinks", imageLinks(thumbnail)));
    }

    private Map<String, Object> volumeWithIsbn(String title, String thumbnail, List<Map<String, Object>> identifiers) {
        return Map.of(
                "volumeInfo", Map.of(
                        "title", title,
                        "authors", List.of("Author"),
                        "industryIdentifiers", identifiers,
                        "imageLinks", imageLinks(thumbnail)));
    }

    private void mockApiResponse(Map<String, Object> response) {
        mockServer.expect(requestTo(org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes")))
                .andRespond(withSuccess(toJson(response), MediaType.APPLICATION_JSON));
    }

    @Test
    void getBooksByAuthor_ShouldUseGoogleBooksQueryAndReturnBooks() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes"),
                        org.hamcrest.Matchers.containsString("q=inauthor:Brandon%20Sanderson"),
                        org.hamcrest.Matchers.containsString("maxResults=5"),
                        org.hamcrest.Matchers.containsString("printType=books"),
                        org.hamcrest.Matchers.containsString("key=test-key"))))
                .andRespond(withSuccess(toJson(Map.of("items", List.of(volume("Tress", "https://books.google.com/tress.jpg")))), MediaType.APPLICATION_JSON));

        var result = googleBooksClient.getBooksByAuthor("Brandon Sanderson", 5);

        assertEquals(1, result.size());
        assertEquals("Tress", result.get(0).title());
        assertEquals("https://books.google.com/tress.jpg", result.get(0).coverUrl());
    }

    @Test
    void getBooksByCategory_ShouldUseSubjectQuery() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes"),
                        org.hamcrest.Matchers.containsString("q=subject:Science%20Fiction"))))
                .andRespond(withSuccess(toJson(Map.of("items", List.of(volume("Dune", "https://books.google.com/dune.jpg")))), MediaType.APPLICATION_JSON));

        var result = googleBooksClient.getBooksByCategory("Science Fiction", 5);

        assertEquals(1, result.size());
        assertEquals("Dune", result.get(0).title());
    }

    @Test
    void getBooksByQuery_ShouldReturnBooks() {
        mockApiResponse(Map.of("items", List.of(volume("Search Book", "https://books.google.com/search.jpg"))));

        var result = googleBooksClient.getBooksByQuery("java", 5);

        assertEquals(1, result.size());
        assertEquals("Search Book", result.get(0).title());
    }

    @Test
    void fetchBooks_ShouldFilterOutBooksWithoutCover() {
        Map<String, Object> withCover = volume("Has Cover", "https://books.google.com/cover.jpg");
        Map<String, Object> noCover = Map.of("volumeInfo", Map.of("title", "No Cover", "authors", List.of("Author")));

        mockApiResponse(Map.of("items", List.of(withCover, noCover)));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals(1, result.size());
        assertEquals("Has Cover", result.get(0).title());
    }

    @Test
    void mapToBook_ShouldPreferIsbn13AndNormalizeHttpCoverUrl() {
        mockApiResponse(Map.of("items", List.of(volumeWithIsbn(
                "ISBN Book",
                "http://books.google.com/isbn.jpg",
                List.of(
                        Map.of("type", "ISBN_10", "identifier", "0123456789"),
                        Map.of("type", "ISBN_13", "identifier", "9781234567890"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals("9781234567890", result.get(0).isbn());
        assertEquals("https://books.google.com/isbn.jpg", result.get(0).coverUrl());
    }

    @Test
    void mapToBook_ShouldPreferLargestAvailableImageLink() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Large Cover Book",
                        "authors", List.of("Author"),
                        "imageLinks", Map.of(
                                "thumbnail", "https://books.google.com/thumb.jpg",
                                "large", "https://books.google.com/large.jpg",
                                "extraLarge", "https://books.google.com/extra-large.jpg"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals("https://books.google.com/extra-large.jpg", result.get(0).coverUrl());
    }

    @Test
    void mapToBook_ShouldUpgradeGoogleZoomParameterForSharperCovers() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Zoomed Book",
                        "authors", List.of("Author"),
                        "imageLinks", Map.of(
                                "thumbnail", "http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&source=gbs_api"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        String coverUrl = result.get(0).coverUrl();
        assertTrue(coverUrl.startsWith("https://books.google.com/books/content?"));
        assertTrue(coverUrl.contains("id=abc"));
        assertTrue(coverUrl.contains("zoom=3"));
        assertTrue(coverUrl.contains("source=gbs_api"));
    }

    @Test
    void mapToBook_ShouldExtractYearLimitCategoriesAndKeepPageCount() {
        Map<String, Object> volumeInfo = new HashMap<>();
        volumeInfo.put("title", "Detailed Book");
        volumeInfo.put("authors", List.of("Author"));
        volumeInfo.put("publishedDate", "2005-11-15");
        volumeInfo.put("pageCount", 207);
        volumeInfo.put("categories", List.of("A", "B", "C", "D"));
        volumeInfo.put("imageLinks", imageLinks("https://books.google.com/detailed.jpg"));
        mockApiResponse(Map.of("items", List.of(Map.of("volumeInfo", volumeInfo))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals(2005, result.get(0).publishYear());
        assertEquals(207, result.get(0).pageCount());
        assertEquals(List.of("A", "B", "C"), result.get(0).categories());
    }

    @Test
    void searchBooks_ShouldReturnBooksWithTotalItems() {
        mockApiResponse(Map.of(
                "totalItems", 42,
                "items", List.of(volume("Found Book", "https://books.google.com/found.jpg"))));

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", 0, 10);

        assertEquals(42, result.totalItems());
        assertEquals(1, result.items().size());
        assertEquals("Found Book", result.items().get(0).title());
    }

    @Test
    void searchBooks_ShouldClampMaxResultsToGoogleLimit() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes"),
                        org.hamcrest.Matchers.containsString("startIndex=20"),
                        org.hamcrest.Matchers.containsString("maxResults=40"))))
                .andRespond(withSuccess(toJson(Map.of("totalItems", 0, "items", List.of())), MediaType.APPLICATION_JSON));

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", 20, 100);

        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
    }

    @Test
    void searchBooks_ShouldClampNegativeOffsetAndLimitToZero() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes"),
                        org.hamcrest.Matchers.containsString("startIndex=0"),
                        org.hamcrest.Matchers.containsString("maxResults=0"))))
                .andRespond(withSuccess(toJson(Map.of("totalItems", 0, "items", List.of())), MediaType.APPLICATION_JSON));

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", -10, -5);

        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
    }

    @Test
    void searchBooks_ShouldOmitApiKey_WhenConfigurationIsBlank() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer localServer = MockRestServiceServer.bindTo(builder).build();
        googleBooksClient = new GoogleBooksClient(builder, "https://www.googleapis.com/books/v1", " ");

        localServer.expect(requestTo(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes"),
                        org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("key=")))))
                .andRespond(withSuccess(toJson(Map.of("totalItems", 0, "items", List.of())), MediaType.APPLICATION_JSON));

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", 0, 10);

        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
    }

    @Test
    void fetchBooks_ShouldReturnEmpty_WhenResponseIsNull() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes")))
                .andRespond(withSuccess("null", MediaType.APPLICATION_JSON));

        var result = googleBooksClient.getBooksByAuthor("Author", 5);

        assertTrue(result.isEmpty());
    }

    @Test
    void searchBooks_ShouldReturnEmpty_WhenApiThrows() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.startsWith("https://www.googleapis.com/books/v1/volumes")))
                .andRespond(withServerError());

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", 0, 10);

        assertTrue(result.items().isEmpty());
        assertEquals(0, result.totalItems());
    }

    @Test
    void searchBooks_ShouldDefaultTotalItemsToZero_WhenMissingFromResponse() {
        mockApiResponse(Map.of("items", List.of(volume("Missing Total", "https://books.google.com/found.jpg"))));

        DiscoverySearchResult result = googleBooksClient.searchBooks("test", 0, 10);

        assertEquals(0, result.totalItems());
        assertEquals(1, result.items().size());
    }

    @Test
    void getBooksByQuery_ShouldReturnEmpty_WhenItemsAreMissing() {
        mockApiResponse(Map.of("totalItems", 5));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertTrue(result.isEmpty());
    }

    @Test
    void mapToBook_ShouldHandleMissingOptionalFields() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Minimal",
                        "imageLinks", Map.of("smallThumbnail", "https://books.google.com/minimal.jpg"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals(1, result.size());
        assertEquals("Minimal", result.get(0).title());
        assertTrue(result.get(0).authors().isEmpty());
        assertTrue(result.get(0).categories().isEmpty());
        assertNull(result.get(0).isbn());
        assertNull(result.get(0).pageCount());
        assertEquals("https://books.google.com/minimal.jpg", result.get(0).coverUrl());
    }

    @Test
    void mapToBook_ShouldFallbackToIsbn10_WhenIsbn13IsUnavailable() {
        mockApiResponse(Map.of("items", List.of(volumeWithIsbn(
                "ISBN10 Book",
                "https://books.google.com/isbn10.jpg",
                List.of(Map.of("type", "ISBN_10", "identifier", "0123456789"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals("0123456789", result.get(0).isbn());
    }

    @Test
    void mapToBook_ShouldFallbackToFirstNonBlankIdentifier_WhenNoKnownIsbnTypeExists() {
        mockApiResponse(Map.of("items", List.of(volumeWithIsbn(
                "Fallback Identifier",
                "https://books.google.com/fallback.jpg",
                List.of(
                        Map.of("type", "OTHER", "identifier", ""),
                        Map.of("type", "OTHER", "identifier", "custom-id"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals("custom-id", result.get(0).isbn());
    }

    @Test
    void mapToBook_ShouldReturnNullPublishYear_WhenPublishedDateDoesNotStartWithYear() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Unknown Year",
                        "authors", List.of("Author"),
                        "publishedDate", "Spring release",
                        "imageLinks", Map.of("thumbnail", "https://books.google.com/unknown-year.jpg"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertNull(result.get(0).publishYear());
    }

    @Test
    void mapToBook_ShouldKeepHighZoomImagesUntouched() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Already Sharp",
                        "authors", List.of("Author"),
                        "imageLinks", Map.of(
                                "thumbnail", "https://books.google.com/books/content?id=abc&zoom=4&source=gbs_api"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertTrue(result.get(0).coverUrl().contains("zoom=4"));
        assertFalse(result.get(0).coverUrl().contains("zoom=3"));
    }

    @Test
    void mapToBook_ShouldReturnNormalizedUrl_WhenImageUrlHasNoQueryString() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Plain Cover",
                        "authors", List.of("Author"),
                        "imageLinks", Map.of("thumbnail", "http://books.google.com/plain-cover.jpg"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals("https://books.google.com/plain-cover.jpg", result.get(0).coverUrl());
    }

    @Test
    void mapToBook_ShouldReturnNormalizedUrl_WhenZoomParameterCannotBeParsed() {
        mockApiResponse(Map.of("items", List.of(Map.of(
                "volumeInfo", Map.of(
                        "title", "Broken Zoom",
                        "authors", List.of("Author"),
                        "imageLinks", Map.of(
                                "thumbnail", "http://books.google.com/books/content?id=abc&zoom=abc&source=gbs_api"))))));

        var result = googleBooksClient.getBooksByQuery("test", 5);

        assertEquals(
                "https://books.google.com/books/content?id=abc&zoom=abc&source=gbs_api",
                result.get(0).coverUrl());
    }
}
