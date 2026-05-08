package com.prksp.kr.controller;

import com.prksp.kr.dto.request.SendMessageRequest;
import com.prksp.kr.dto.response.ChatResponse;
import com.prksp.kr.dto.response.MessageResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Chats", description = "Чаты и сообщения")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    @Operation(summary = "Свои чаты")
    public ResponseEntity<List<ChatResponse>> getUserChats(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(chatService.getUserChats(currentUser));
    }

    @PostMapping
    @Operation(summary = "Открыть или создать чат с психологом (?psychologistId=)")
    public ResponseEntity<ChatResponse> getOrCreateChat(
            @AuthenticationPrincipal User currentUser,
            @RequestParam UUID psychologistId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(chatService.getOrCreateChat(currentUser, psychologistId));
    }

    @GetMapping("/{chatId}/messages")
    @Operation(summary = "История сообщений чата")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID chatId) {
        return ResponseEntity.ok(chatService.getChatMessages(currentUser, chatId));
    }

    @PostMapping("/{chatId}/messages")
    @Operation(summary = "Отправить сообщение (REST; также доступен WebSocket /app/chat.send.{chatId})")
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID chatId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chatService.sendMessage(currentUser, chatId, request));
    }
}
