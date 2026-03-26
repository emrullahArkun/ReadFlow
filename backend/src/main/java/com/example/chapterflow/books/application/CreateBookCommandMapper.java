package com.example.chapterflow.books.application;

import com.example.chapterflow.books.domain.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface CreateBookCommandMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "author", source = "authorName")
    @Mapping(target = "currentPage", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "completed", ignore = true)
    @Mapping(target = "readingGoalType", ignore = true)
    @Mapping(target = "readingGoalPages", ignore = true)
    @Mapping(target = "readingSessions", ignore = true)
    Book toEntity(CreateBookCommand command);
}
