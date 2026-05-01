package com.prksp.kr.dto.request;

import com.prksp.kr.entity.SessionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSessionStatusRequest {

    @NotNull
    private SessionStatus status;

    private String meetingLink;
}
