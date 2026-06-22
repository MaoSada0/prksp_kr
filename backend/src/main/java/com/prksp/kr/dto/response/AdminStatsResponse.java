package com.prksp.kr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long clients;
    private long psychologists;
    private long admins;
    private long totalSessions;
    private long totalReviews;
}
