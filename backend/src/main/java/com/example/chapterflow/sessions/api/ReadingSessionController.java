package com.example.chapterflow.sessions.api;

import com.example.chapterflow.auth.domain.User;
import com.example.chapterflow.sessions.application.ReadingSessionService;
import com.example.chapterflow.sessions.api.dto.ExcludeTimeRequest;
import com.example.chapterflow.sessions.api.dto.ReadingSessionDto;
import com.example.chapterflow.sessions.api.dto.StartSessionRequest;
import com.example.chapterflow.sessions.api.dto.StopSessionRequest;
import com.example.chapterflow.sessions.domain.ReadingSession;
import com.example.chapterflow.shared.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ReadingSessionController {

    private final ReadingSessionService sessionService;
    private final ReadingSessionMapper sessionMapper;

    @PostMapping("/start")
    public ResponseEntity<ReadingSessionDto> startSession(
            @RequestBody @Valid StartSessionRequest request,
            @CurrentUser User user) {
        ReadingSession session = sessionService.startSession(user, request.bookId());
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionMapper.toDto(session));
    }

    @PostMapping("/stop")
    public ResponseEntity<ReadingSessionDto> stopSession(
            @RequestBody @Valid StopSessionRequest request,
            @CurrentUser User user) {
        ReadingSession session = sessionService.stopSession(user, request.endTime(), request.endPage());
        return ResponseEntity.ok(sessionMapper.toDto(session));
    }

    @GetMapping("/active")
    public ResponseEntity<ReadingSessionDto> getActiveSession(@CurrentUser User user) {
        return sessionService.getActiveSession(user)
                .map(sessionMapper::toDto)
                .map(dto -> ResponseEntity.ok()
                        .cacheControl(org.springframework.http.CacheControl.noStore())
                        .body(dto))
                .orElse(ResponseEntity.noContent()
                        .cacheControl(org.springframework.http.CacheControl.noStore())
                        .build());
    }

    @PostMapping("/active/exclude-time")
    public ResponseEntity<ReadingSessionDto> excludeTime(
            @RequestBody @Valid ExcludeTimeRequest request,
            @CurrentUser User user) {
        ReadingSession session = sessionService.excludeTime(user, request.millis());
        return ResponseEntity.ok(sessionMapper.toDto(session));
    }

    @PostMapping("/active/pause")
    public ResponseEntity<ReadingSessionDto> pauseSession(@CurrentUser User user) {
        ReadingSession session = sessionService.pauseSession(user);
        return ResponseEntity.ok(sessionMapper.toDto(session));
    }

    @PostMapping("/active/resume")
    public ResponseEntity<ReadingSessionDto> resumeSession(@CurrentUser User user) {
        ReadingSession session = sessionService.resumeSession(user);
        return ResponseEntity.ok(sessionMapper.toDto(session));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReadingSessionDto>> getSessionsByBook(@PathVariable Long bookId,
            @CurrentUser User user) {
        List<ReadingSessionDto> sessions = sessionService.getSessionsByBook(user, bookId)
                .stream()
                .map(sessionMapper::toDto)
                .toList();
        return ResponseEntity.ok(sessions);
    }

}
