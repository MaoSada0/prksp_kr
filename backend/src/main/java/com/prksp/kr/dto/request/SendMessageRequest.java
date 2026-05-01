package com.prksp.kr.dto.request;

import com.prksp.kr.entity.MessageType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotBlank
    private String content;

    private MessageType type = MessageType.TEXT;
}
