package com.prksp.kr.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
}
