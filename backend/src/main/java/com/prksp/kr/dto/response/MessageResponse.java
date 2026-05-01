package com.prksp.kr.dto.response;

import com.prksp.kr.entity.MessageType;
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
public class MessageResponse {
    private UUID id;
    private UUID chatId;
    private UUID senderId;
    private String senderName;
    private String content;
    private MessageType type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
