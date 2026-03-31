package com.example.mybooktracker.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class SecurityConfigTest {

    @Test
    void jwtDecoder_ShouldThrow_WhenSecretTooShort() {
        SecurityConfig securityConfig = new SecurityConfig(
                new CookieBearerTokenResolver(),
                new JwtUserAuthenticationConverter());
        ReflectionTestUtils.setField(securityConfig, "jwtSecret", "short");
        ReflectionTestUtils.setField(securityConfig, "jwtIssuer", "issuer");

        assertThrows(IllegalStateException.class, securityConfig::jwtDecoder);
    }

    @Test
    void csrfCookieFilter_ShouldContinue_WhenCsrfTokenMissing() throws ServletException, IOException {
        SecurityConfig.CsrfCookieFilter filter = new SecurityConfig.CsrfCookieFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void csrfCookieFilter_ShouldMaterializeToken_WhenCsrfTokenPresent() throws ServletException, IOException {
        SecurityConfig.CsrfCookieFilter filter = new SecurityConfig.CsrfCookieFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        CsrfToken csrfToken = mock(CsrfToken.class);
        request.setAttribute("_csrf", csrfToken);

        filter.doFilterInternal(request, response, chain);
        verify(chain).doFilter(request, response);
    }
}
