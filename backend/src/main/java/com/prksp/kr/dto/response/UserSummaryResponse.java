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
public class UserSummaryResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String photoUrl;
    private LocalDateTime createdAt;
}
