package com.example.chapterflow.discovery.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LogSearchRequest(@NotBlank String query) {}
