package com.example.chapterflow.books.api;

import com.example.chapterflow.books.api.dto.BookDto;
import com.example.chapterflow.books.domain.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface BookMapper {

    @Mapping(target = "authorName", source = "author")
    @Mapping(target = "readingGoalProgress", ignore = true)
    BookDto toDto(Book book);
}
