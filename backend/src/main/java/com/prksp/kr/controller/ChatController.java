package com.prksp.kr.controller;

import com.prksp.kr.dto.request.SendMessageRequest;
import com.prksp.kr.dto.response.ChatResponse;
import com.prksp.kr.dto.response.MessageResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getUserChats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(chatService.getUserChats(currentUser));
    }

    @PostMapping
    public ResponseEntity<ChatResponse> getOrCreateChat(
            @AuthenticationPrincipal User currentUser,
            @RequestParam UUID psychologistId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(chatService.getOrCreateChat(currentUser, psychologistId));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getChatMessages(currentUser, chatId));
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID chatId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendMessage(currentUser, chatId, request));
    }
}
