package com.prksp.kr.dto.request;

import com.prksp.kr.entity.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {
    @NotNull
    private UserRole role;
}
