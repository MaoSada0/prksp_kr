package com.prksp.kr.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String bio;
    private String education;
    private Integer experienceYears;
    private String photoUrl;
}
