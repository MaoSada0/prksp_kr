package com.prksp.kr.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateSessionRequest {

    @NotNull
    private UUID psychologistId;

    @NotNull
    private UUID serviceId;

    @NotNull
    private UUID slotId;

    private String meetingLink;
}
