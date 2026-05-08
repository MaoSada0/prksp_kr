package com.prksp.kr.controller;

import com.prksp.kr.dto.request.CreateReviewRequest;
import com.prksp.kr.dto.response.ReviewResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/psychologists")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Отзывы о психологах")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{psychologistId}/reviews")
    @Operation(summary = "Отзывы о психологе")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable UUID psychologistId) {
        return ResponseEntity.ok(reviewService.getPsychologistReviews(psychologistId));
    }

    @PostMapping("/{psychologistId}/reviews")
    @Operation(summary = "Оставить отзыв (только клиент, один раз)")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID psychologistId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(currentUser, psychologistId, request));
    }

    @PutMapping("/{psychologistId}/reviews")
    @Operation(summary = "Обновить свой отзыв")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID psychologistId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(currentUser, psychologistId, request));
    }
}
