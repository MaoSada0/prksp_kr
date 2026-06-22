package com.prksp.kr.fuzz;

import com.prksp.kr.dto.request.CreateReviewRequest;
import com.prksp.kr.entity.Review;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.UserRepository;
import com.prksp.kr.service.ReviewService;
import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.constraints.StringLength;
import net.jqwik.api.lifecycle.BeforeProperty;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReviewServiceFuzzTest {

    private ReviewRepository reviewRepository;
    private UserRepository userRepository;
    private ReviewService reviewService;

    @BeforeProperty
    void setUp() {
        reviewRepository = mock(ReviewRepository.class);
        userRepository = mock(UserRepository.class);
        reviewService = new ReviewService(reviewRepository, userRepository);
    }

    /**
     * Сервисный слой не валидирует значение рейтинга (валидация @Min/@Max
     * применяется только через Spring MVC @Valid на уровне контроллера).
     * При прямом вызове сервиса допустимы любые целочисленные значения.
     *
     * НАХОДКА: Это потенциальное место обхода валидации — при прямом обращении
     * к сервису можно сохранить рейтинг вне диапазона [1, 5].
     */
    @Property(tries = 500)
    @Label("Сервис принимает любое целое значение рейтинга без собственной валидации")
    void createReview_anyIntegerRating_acceptedByService(
            @ForAll @IntRange(min = -10_000, max = 10_000) int rating) {

        User client = buildUser(UserRole.CLIENT);
        User psychologist = buildUser(UserRole.PSYCHOLOGIST);
        Review saved = buildReview(psychologist, client, rating, "content");

        when(userRepository.findById(psychologist.getId())).thenReturn(Optional.of(psychologist));
        when(reviewRepository.existsByPsychologistAndClient(psychologist, client)).thenReturn(false);
        when(reviewRepository.save(any())).thenReturn(saved);

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(rating);
        req.setContent("content");

        var response = reviewService.createReview(client, psychologist.getId(), req);
        assertThat(response.getRating()).isEqualTo(rating);
    }

    /**
     * Текст отзыва с произвольными символами (включая Unicode, спецсимволы,
     * потенциальные XSS/SQL-паттерны) сохраняется и возвращается без изменений.
     */
    @Property(tries = 500)
    @Label("Произвольный контент отзыва сохраняется без искажений")
    void createReview_arbitraryContent_preservedExactly(
            @ForAll @StringLength(max = 5_000) String content) {

        User client = buildUser(UserRole.CLIENT);
        User psychologist = buildUser(UserRole.PSYCHOLOGIST);
        Review saved = buildReview(psychologist, client, 5, content);

        when(userRepository.findById(psychologist.getId())).thenReturn(Optional.of(psychologist));
        when(reviewRepository.existsByPsychologistAndClient(psychologist, client)).thenReturn(false);
        when(reviewRepository.save(any())).thenReturn(saved);

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(5);
        req.setContent(content);

        var response = reviewService.createReview(client, psychologist.getId(), req);
        assertThat(response.getContent()).isEqualTo(content);
    }

    /**
     * Повторный отзыв всегда выбрасывает исключение, независимо от
     * конкретных значений рейтинга и контента.
     */
    @Property(tries = 300)
    @Label("Дублирующийся отзыв всегда вызывает исключение")
    void createReview_duplicate_alwaysThrows(
            @ForAll @IntRange(min = 1, max = 5) int rating,
            @ForAll @StringLength(max = 500) String content) {

        User client = buildUser(UserRole.CLIENT);
        User psychologist = buildUser(UserRole.PSYCHOLOGIST);

        when(userRepository.findById(psychologist.getId())).thenReturn(Optional.of(psychologist));
        when(reviewRepository.existsByPsychologistAndClient(psychologist, client)).thenReturn(true);

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(rating);
        req.setContent(content);

        assertThatThrownBy(() -> reviewService.createReview(client, psychologist.getId(), req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    /**
     * Психолог не может оставить отзыв — AccessDeniedException выбрасывается
     * ДО каких-либо обращений к репозиторию, для любого рейтинга.
     */
    @Property(tries = 300)
    @Label("Психолог не может оставить отзыв при любом значении рейтинга")
    void createReview_byPsychologist_alwaysAccessDenied(
            @ForAll @IntRange(min = -100, max = 100) int rating) {

        User psychologist = buildUser(UserRole.PSYCHOLOGIST);
        UUID targetId = UUID.randomUUID();

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(rating);
        req.setContent("try");

        assertThatThrownBy(() -> reviewService.createReview(psychologist, targetId, req))
                .isInstanceOf(AccessDeniedException.class);

        // Проверяем, что до репозитория дело не дошло
        verifyNoInteractions(userRepository, reviewRepository);
    }

    /**
     * Обновление отзыва сохраняет произвольный контент без изменений,
     * независимо от спецсимволов в тексте.
     */
    @Property(tries = 300)
    @Label("updateReview сохраняет произвольный контент без изменений")
    void updateReview_arbitraryContent_preservedExactly(
            @ForAll @IntRange(min = 1, max = 5) int rating,
            @ForAll @StringLength(max = 2_000) String content) {

        User client = buildUser(UserRole.CLIENT);
        User psychologist = buildUser(UserRole.PSYCHOLOGIST);
        Review existing = buildReview(psychologist, client, 5, "old content");
        Review updated = buildReview(psychologist, client, rating, content);

        when(userRepository.findById(psychologist.getId())).thenReturn(Optional.of(psychologist));
        when(reviewRepository.findByPsychologistAndClient(psychologist, client))
                .thenReturn(Optional.of(existing));
        when(reviewRepository.save(any())).thenReturn(updated);

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRating(rating);
        req.setContent(content);

        var response = reviewService.updateReview(client, psychologist.getId(), req);
        assertThat(response.getRating()).isEqualTo(rating);
        assertThat(response.getContent()).isEqualTo(content);
    }

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .email("u@example.com")
                .firstName("Test")
                .lastName("User")
                .role(role)
                .build();
    }

    private Review buildReview(User psychologist, User client, int rating, String content) {
        Review r = Review.builder()
                .id(UUID.randomUUID())
                .psychologist(psychologist)
                .client(client)
                .rating(rating)
                .content(content)
                .build();
        return r;
    }
}
