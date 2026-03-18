package com.example.readflow.discovery;

import com.example.readflow.discovery.dto.RecommendedBookDto;
import com.example.readflow.discovery.dto.SearchResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleBooksClient {

    private final RestTemplate restTemplate;

    @Value("${google.books.api.url:https://www.googleapis.com/books/v1/volumes}")
    private String googleBooksApiUrl;

    public List<RecommendedBookDto> getBooksByAuthor(String author, int maxResults) {
        String url = googleBooksApiUrl + "?q=inauthor:" + encodeParam(author) + "&maxResults=" + maxResults;
        return fetchBooks(url);
    }

    public List<RecommendedBookDto> getBooksByCategory(String category, int maxResults) {
        String url = googleBooksApiUrl + "?q=subject:" + encodeParam(category) + "&maxResults=" + maxResults;
        return fetchBooks(url);
    }

    public List<RecommendedBookDto> getBooksByQuery(String query, int maxResults) {
        String url = googleBooksApiUrl + "?q=" + encodeParam(query) + "&maxResults=" + maxResults;
        return fetchBooks(url);
    }

    public SearchResultDto searchBooks(String query, int startIndex, int maxResults) {
        String url = googleBooksApiUrl + "?q=" + encodeParam(query)
                + "&startIndex=" + startIndex + "&maxResults=" + maxResults;
        return fetchBooksWithTotal(url);
    }

    @SuppressWarnings("unchecked")
    private List<RecommendedBookDto> fetchBooks(String url) {
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("items")) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            return items.stream()
                    .filter(this::hasRealCover)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        } catch (RestClientException e) {
            log.error("Failed to fetch books from Google API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private SearchResultDto fetchBooksWithTotal(String url) {
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !response.containsKey("items")) {
                int total = response != null && response.containsKey("totalItems")
                        ? ((Number) response.get("totalItems")).intValue() : 0;
                return new SearchResultDto(Collections.emptyList(), total);
            }

            int totalItems = response.containsKey("totalItems")
                    ? ((Number) response.get("totalItems")).intValue() : 0;

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            List<RecommendedBookDto> books = items.stream()
                    .filter(this::hasRealCover)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            return new SearchResultDto(books, totalItems);
        } catch (RestClientException e) {
            log.error("Failed to search books from Google API: {}", e.getMessage());
            return new SearchResultDto(Collections.emptyList(), 0);
        }
    }

    @SuppressWarnings("unchecked")
    private RecommendedBookDto mapToDto(Map<String, Object> item) {
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");

        String title = (String) volumeInfo.get("title");
        List<String> authors = (List<String>) volumeInfo.get("authors");
        List<String> categories = (List<String>) volumeInfo.get("categories");
        String publishedDate = (String) volumeInfo.get("publishedDate");
        Integer pageCount = (Integer) volumeInfo.get("pageCount");

        String isbn = null;
        List<Map<String, String>> identifiers = (List<Map<String, String>>) volumeInfo.get("industryIdentifiers");
        if (identifiers != null) {
            isbn = identifiers.stream()
                    .filter(id -> "ISBN_13".equals(id.get("type")) || "ISBN_10".equals(id.get("type")))
                    .map(id -> id.get("identifier"))
                    .findFirst()
                    .orElse(null);
        }

        String coverUrl = null;
        Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
        if (imageLinks != null) {
            coverUrl = imageLinks.getOrDefault("thumbnail", imageLinks.get("smallThumbnail"));
        }

        return new RecommendedBookDto(title, authors, categories, publishedDate, pageCount, isbn, coverUrl);
    }

    @SuppressWarnings("unchecked")
    private boolean hasRealCover(Map<String, Object> item) {
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");
        if (volumeInfo == null) return false;

        Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
        if (imageLinks == null || (imageLinks.get("thumbnail") == null && imageLinks.get("smallThumbnail") == null)) {
            return false;
        }

        Map<String, Object> readingModes = (Map<String, Object>) volumeInfo.get("readingModes");
        if (readingModes != null && Boolean.FALSE.equals(readingModes.get("image"))) {
            return false;
        }

        return true;
    }

    private String encodeParam(String param) {
        return URLEncoder.encode(param, StandardCharsets.UTF_8);
    }
}
