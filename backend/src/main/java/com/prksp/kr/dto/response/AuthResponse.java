package com.prksp.kr.dto.response;

import com.prksp.kr.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String photoUrl;
}
