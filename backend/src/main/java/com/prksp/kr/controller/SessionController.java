package com.prksp.kr.controller;

import com.prksp.kr.dto.request.CreateCommentRequest;
import com.prksp.kr.dto.request.CreateSessionRequest;
import com.prksp.kr.dto.request.UpdateSessionStatusRequest;
import com.prksp.kr.dto.response.CommentResponse;
import com.prksp.kr.dto.response.SessionResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.createSession(currentUser, request));
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getSessions(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sessionService.getUserSessions(currentUser));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getSession(currentUser, sessionId));
    }

    @PatchMapping("/{sessionId}/status")
    public ResponseEntity<SessionResponse> updateStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID sessionId,
            @Valid @RequestBody UpdateSessionStatusRequest request) {
        return ResponseEntity.ok(sessionService.updateStatus(currentUser, sessionId, request));
    }

    @GetMapping("/{sessionId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.getComments(currentUser, sessionId));
    }

    @PostMapping("/{sessionId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID sessionId,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.addComment(currentUser, sessionId, request));
    }
}
