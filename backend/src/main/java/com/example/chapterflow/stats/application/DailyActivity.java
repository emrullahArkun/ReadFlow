package com.example.chapterflow.stats.application;

import java.time.LocalDate;

public record DailyActivity(LocalDate date, int pagesRead) {
}
