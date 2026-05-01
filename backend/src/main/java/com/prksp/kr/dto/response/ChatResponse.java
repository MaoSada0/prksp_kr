package com.prksp.kr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID psychologistId;
    private String psychologistName;
    private LocalDateTime createdAt;
    private MessageResponse lastMessage;
}
