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
public class ReviewResponse {
    private UUID id;
    private UUID psychologistId;
    private UUID clientId;
    private String clientName;
    private String clientPhotoUrl;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
}
