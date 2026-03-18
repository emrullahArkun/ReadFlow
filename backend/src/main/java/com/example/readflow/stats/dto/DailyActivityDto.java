package com.example.readflow.stats.dto;

import java.time.LocalDate;

public record DailyActivityDto(LocalDate date, int pagesRead) {
}
