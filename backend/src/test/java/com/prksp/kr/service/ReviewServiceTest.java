package com.prksp.kr.service;

import com.prksp.kr.dto.request.CreateReviewRequest;
import com.prksp.kr.dto.response.ReviewResponse;
import com.prksp.kr.entity.Review;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ReviewService reviewService;

    private User makeUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .email("u@example.com")
                .firstName("Anna")
                .lastName("Smith")
                .role(role)
                .build();
    }

    private Review makeReview(User psychologist, User client, int rating) {
        return Review.builder()
                .id(UUID.randomUUID())
                .psychologist(psychologist)
                .client(client)
                .rating(rating)
                .content("Good session")
                .build();
    }

    @Test
    void getPsychologistReviews_returnsAll() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        User client = makeUser(UserRole.CLIENT);
        Review review = makeReview(psy, client, 5);

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(reviewRepository.findByPsychologistOrderByCreatedAtDesc(psy)).thenReturn(List.of(review));

        List<ReviewResponse> result = reviewService.getPsychologistReviews(psy.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRating()).isEqualTo(5);
        assertThat(result.get(0).getClientName()).isEqualTo("Anna Smith");
    }

    @Test
    void getPsychologistReviews_psychologistNotFound_throws() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.getPsychologistReviews(id))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createReview_success_returnsResponse() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        User client = makeUser(UserRole.CLIENT);
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(4);
        req.setContent("Very helpful");

        Review saved = makeReview(psy, client, 4);
        saved.setContent("Very helpful");

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(reviewRepository.existsByPsychologistAndClient(psy, client)).thenReturn(false);
        when(reviewRepository.save(any())).thenReturn(saved);

        ReviewResponse result = reviewService.createReview(client, psy.getId(), req);

        assertThat(result.getRating()).isEqualTo(4);
        assertThat(result.getContent()).isEqualTo("Very helpful");
        verify(reviewRepository).save(any());
    }

    @Test
    void createReview_byPsychologist_throws() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(5);

        assertThatThrownBy(() -> reviewService.createReview(psy, UUID.randomUUID(), req))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createReview_duplicate_throws() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        User client = makeUser(UserRole.CLIENT);
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(5);

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(reviewRepository.existsByPsychologistAndClient(psy, client)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(client, psy.getId(), req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void updateReview_success_updatesFields() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        User client = makeUser(UserRole.CLIENT);
        Review existing = makeReview(psy, client, 5);
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(3);
        req.setContent("Updated opinion");

        Review updated = makeReview(psy, client, 3);
        updated.setContent("Updated opinion");

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(reviewRepository.findByPsychologistAndClient(psy, client)).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any())).thenReturn(updated);

        ReviewResponse result = reviewService.updateReview(client, psy.getId(), req);

        assertThat(result.getRating()).isEqualTo(3);
        assertThat(result.getContent()).isEqualTo("Updated opinion");
    }

    @Test
    void updateReview_notFound_throws() {
        User psy = makeUser(UserRole.PSYCHOLOGIST);
        User client = makeUser(UserRole.CLIENT);
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(3);

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(reviewRepository.findByPsychologistAndClient(psy, client)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.updateReview(client, psy.getId(), req))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
