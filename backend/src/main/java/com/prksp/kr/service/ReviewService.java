package com.prksp.kr.service;

import com.prksp.kr.dto.request.CreateReviewRequest;
import com.prksp.kr.dto.response.ReviewResponse;
import com.prksp.kr.entity.Review;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public List<ReviewResponse> getPsychologistReviews(UUID psychologistId) {
        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));
        return reviewRepository.findByPsychologistOrderByCreatedAtDesc(psychologist).stream()
                .map(this::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse createReview(User client, UUID psychologistId, CreateReviewRequest request) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new AccessDeniedException("Only clients can leave reviews");
        }

        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));

        if (reviewRepository.existsByPsychologistAndClient(psychologist, client)) {
            throw new IllegalArgumentException("Review already exists");
        }

        Review review = Review.builder()
                .psychologist(psychologist)
                .client(client)
                .rating(request.getRating())
                .content(request.getContent())
                .build();

        return toReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(User client, UUID psychologistId, CreateReviewRequest request) {
        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));

        Review review = reviewRepository.findByPsychologistAndClient(psychologist, client)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setRating(request.getRating());
        review.setContent(request.getContent());

        return toReviewResponse(reviewRepository.save(review));
    }

    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .psychologistId(review.getPsychologist().getId())
                .clientId(review.getClient().getId())
                .clientName(review.getClient().getFirstName() + " " + review.getClient().getLastName())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
