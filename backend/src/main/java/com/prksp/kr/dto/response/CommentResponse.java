package com.prksp.kr.dto.response;

import com.prksp.kr.entity.UserRole;
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
public class CommentResponse {
    private UUID id;
    private UUID sessionId;
    private UUID authorId;
    private String authorName;
    private String authorPhotoUrl;
    private UserRole authorRole;
    private String content;
    private LocalDateTime createdAt;
}
