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
public class SlotResponse {
    private UUID id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isBooked;
    private UUID sessionId;
    private String clientName;
}
