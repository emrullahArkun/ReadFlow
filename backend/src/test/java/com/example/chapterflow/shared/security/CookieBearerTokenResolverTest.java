package com.example.chapterflow.shared.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class CookieBearerTokenResolverTest {

    private final CookieBearerTokenResolver resolver = new CookieBearerTokenResolver();

    @Test
    void resolve_ShouldReturnToken_WhenJwtCookiePresent() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("jwt", "my-token"));

        assertEquals("my-token", resolver.resolve(request));
    }

    @Test
    void resolve_ShouldReturnNull_WhenNoCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        // no cookies set

        assertNull(resolver.resolve(request));
    }

    @Test
    void resolve_ShouldReturnNull_WhenNoJwtCookie() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("other", "value"));

        assertNull(resolver.resolve(request));
    }

    @Test
    void resolve_ShouldReturnNull_WhenJwtCookieIsBlank() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("jwt", "   "));

        assertNull(resolver.resolve(request));
    }

    @Test
    void resolve_ShouldReturnNull_WhenJwtCookieIsEmpty() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("jwt", ""));

        assertNull(resolver.resolve(request));
    }

    @Test
    void resolve_ShouldReturnToken_WhenMultipleCookiesPresent() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(
                new Cookie("session", "abc"),
                new Cookie("jwt", "the-token"),
                new Cookie("other", "xyz"));

        assertEquals("the-token", resolver.resolve(request));
    }
}
