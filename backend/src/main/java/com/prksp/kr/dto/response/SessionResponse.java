package com.prksp.kr.dto.response;

import com.prksp.kr.entity.SessionStatus;
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
public class SessionResponse {
    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID psychologistId;
    private String psychologistName;
    private UUID serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;
    private SessionStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String meetingLink;
    private LocalDateTime createdAt;
}
