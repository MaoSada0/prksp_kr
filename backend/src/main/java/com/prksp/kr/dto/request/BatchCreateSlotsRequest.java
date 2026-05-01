package com.prksp.kr.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BatchCreateSlotsRequest {

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime fromTime;

    @NotNull
    private LocalTime toTime;

    @NotNull
    @Min(15)
    private Integer slotDurationMinutes;
}
