package com.prksp.kr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PsychologistResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String education;
    private Integer experienceYears;
    private String photoUrl;
    private Boolean isVerified;
    private Double averageRating;
    private Integer reviewCount;
}
