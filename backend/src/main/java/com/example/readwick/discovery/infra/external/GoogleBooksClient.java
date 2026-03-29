package com.example.readwick.discovery.infra.external;

import com.example.readwick.discovery.domain.BookDiscoveryProvider;
import com.example.readwick.discovery.domain.DiscoveryBook;
import com.example.readwick.discovery.domain.DiscoverySearchResult;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
@ConditionalOnProperty(name = "app.discovery.provider", havingValue = "google-books", matchIfMissing = true)
// Adapter pattern: translates the Google Books API into the provider interface used by the discovery layer.
public class GoogleBooksClient implements BookDiscoveryProvider {

    private static final String VOLUMES_PATH = "/volumes";
    private static final int MAX_RESULTS_PER_REQUEST = 40;
    private static final int MAX_CATEGORIES = 3;
    private static final Pattern PUBLISHED_YEAR_PATTERN = Pattern.compile("^(\\d{4})");

    private final RestClient restClient;
    private final String apiKey;

    public GoogleBooksClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.google-books.base-url:https://www.googleapis.com/books/v1}") String baseUrl,
            @Value("${app.google-books.api-key:}") String apiKey) {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();
        this.apiKey = apiKey;
    }

    @Cacheable(value = "discoveryBooks", key = "'author:' + #author + ':' + #maxResults")
    @Override
    public List<DiscoveryBook> getBooksByAuthor(String author, int maxResults) {
        return fetchBooks(buildFieldQuery("inauthor", author), 0, maxResults);
    }

    @Cacheable(value = "discoveryBooks", key = "'category:' + #category + ':' + #maxResults")
    @Override
    public List<DiscoveryBook> getBooksByCategory(String category, int maxResults) {
        return fetchBooks(buildFieldQuery("subject", category), 0, maxResults);
    }

    @Cacheable(value = "discoveryBooks", key = "'query:' + #query + ':' + #maxResults")
    @Override
    public List<DiscoveryBook> getBooksByQuery(String query, int maxResults) {
        return fetchBooks(query, 0, maxResults);
    }

    @Cacheable(value = "discoverySearch", key = "#query + ':' + #offset + ':' + #limit")
    @Override
    public DiscoverySearchResult searchBooks(String query, int offset, int limit) {
        try {
            GoogleBooksResponse response = search(query, offset, limit);
            if (response == null) {
                return new DiscoverySearchResult(Collections.emptyList(), 0);
            }

            List<DiscoveryBook> books = mapBooks(response.items());
            int totalItems = response.totalItems() != null ? response.totalItems() : 0;
            return new DiscoverySearchResult(books, totalItems);
        } catch (RestClientException e) {
            log.error("Failed to search books from Google Books: {}", e.getMessage());
            return new DiscoverySearchResult(Collections.emptyList(), 0);
        }
    }

    private List<DiscoveryBook> fetchBooks(String query, int offset, int limit) {
        try {
            GoogleBooksResponse response = search(query, offset, limit);
            if (response == null || response.items() == null) {
                return Collections.emptyList();
            }

            return mapBooks(response.items());
        } catch (RestClientException e) {
            log.error("Failed to fetch books from Google Books: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private GoogleBooksResponse search(String query, int offset, int limit) {
        return restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path(VOLUMES_PATH)
                            .queryParam("q", query)
                            .queryParam("startIndex", Math.max(offset, 0))
                            .queryParam("maxResults", clampMaxResults(limit))
                            .queryParam("printType", "books");

                    if (StringUtils.hasText(apiKey)) {
                        uriBuilder.queryParam("key", apiKey);
                    }

                    return uriBuilder.build();
                })
                .retrieve()
                .body(GoogleBooksResponse.class);
    }

    private List<DiscoveryBook> mapBooks(List<GoogleBookItem> items) {
        if (items == null) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(GoogleBookItem::volumeInfo)
                .filter(volumeInfo -> volumeInfo != null && hasCover(volumeInfo))
                .map(this::mapToBook)
                .toList();
    }

    private boolean hasCover(GoogleVolumeInfo volumeInfo) {
        return StringUtils.hasText(extractCoverUrl(volumeInfo));
    }

    private DiscoveryBook mapToBook(GoogleVolumeInfo volumeInfo) {
        List<String> categories = volumeInfo.categories();
        if (categories != null && categories.size() > MAX_CATEGORIES) {
            categories = categories.subList(0, MAX_CATEGORIES);
        }

        return new DiscoveryBook(
                volumeInfo.title(),
                volumeInfo.authors(),
                categories,
                extractPublishYear(volumeInfo.publishedDate()),
                volumeInfo.pageCount(),
                extractIsbn(volumeInfo.industryIdentifiers()),
                extractCoverUrl(volumeInfo));
    }

    private String buildFieldQuery(String field, String value) {
        return field + ":" + value;
    }

    private int clampMaxResults(int limit) {
        return Math.max(0, Math.min(limit, MAX_RESULTS_PER_REQUEST));
    }

    private Integer extractPublishYear(String publishedDate) {
        if (!StringUtils.hasText(publishedDate)) {
            return null;
        }

        Matcher matcher = PUBLISHED_YEAR_PATTERN.matcher(publishedDate);
        return matcher.find() ? Integer.valueOf(matcher.group(1)) : null;
    }

    private String extractIsbn(List<IndustryIdentifier> identifiers) {
        if (identifiers == null || identifiers.isEmpty()) {
            return null;
        }

        return identifiers.stream()
                .filter(identifier -> "ISBN_13".equals(identifier.type()) && StringUtils.hasText(identifier.identifier()))
                .map(IndustryIdentifier::identifier)
                .findFirst()
                .or(() -> identifiers.stream()
                        .filter(identifier -> "ISBN_10".equals(identifier.type()) && StringUtils.hasText(identifier.identifier()))
                        .map(IndustryIdentifier::identifier)
                        .findFirst())
                .orElseGet(() -> identifiers.stream()
                        .map(IndustryIdentifier::identifier)
                        .filter(StringUtils::hasText)
                        .findFirst()
                        .orElse(null));
    }

    private String extractCoverUrl(GoogleVolumeInfo volumeInfo) {
        if (volumeInfo.imageLinks() == null) {
            return null;
        }

        String rawUrl = firstNonBlank(
                volumeInfo.imageLinks().extraLarge(),
                volumeInfo.imageLinks().large(),
                volumeInfo.imageLinks().medium(),
                volumeInfo.imageLinks().small(),
                volumeInfo.imageLinks().thumbnail(),
                volumeInfo.imageLinks().smallThumbnail());

        if (!StringUtils.hasText(rawUrl)) {
            return null;
        }

        return enhanceGoogleBooksImageUrl(rawUrl);
    }

    private String enhanceGoogleBooksImageUrl(String rawUrl) {
        String normalizedUrl = rawUrl.replace("http://", "https://");

        if (!normalizedUrl.contains("books.google") || !normalizedUrl.contains("?")) {
            return normalizedUrl;
        }

        try {
            var builder = UriComponentsBuilder.fromUriString(normalizedUrl);
            String zoom = builder.build().getQueryParams().getFirst("zoom");
            if (!StringUtils.hasText(zoom) || Integer.parseInt(zoom) < 3) {
                builder.replaceQueryParam("zoom", 3);
            }
            return builder.build(true).toUriString();
        } catch (RuntimeException e) {
            return normalizedUrl;
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private record GoogleBooksResponse(
            @JsonProperty("totalItems") Integer totalItems,
            List<GoogleBookItem> items
    ) {}

    private record GoogleBookItem(
            @JsonProperty("volumeInfo") GoogleVolumeInfo volumeInfo
    ) {}

    private record GoogleVolumeInfo(
            String title,
            List<String> authors,
            List<String> categories,
            @JsonProperty("publishedDate") String publishedDate,
            @JsonProperty("pageCount") Integer pageCount,
            @JsonProperty("industryIdentifiers") List<IndustryIdentifier> industryIdentifiers,
            @JsonProperty("imageLinks") ImageLinks imageLinks
    ) {}

    private record IndustryIdentifier(
            String type,
            String identifier
    ) {}

    private record ImageLinks(
            @JsonProperty("extraLarge") String extraLarge,
            String large,
            String medium,
            String small,
            String thumbnail,
            @JsonProperty("smallThumbnail") String smallThumbnail
    ) {}
}
