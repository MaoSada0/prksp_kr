package com.prksp.kr.repository;

import com.prksp.kr.entity.Review;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByPsychologistOrderByCreatedAtDesc(User psychologist);
    Optional<Review> findByPsychologistAndClient(User psychologist, User client);
    boolean existsByPsychologistAndClient(User psychologist, User client);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.psychologist = :psychologist")
    Double findAverageRatingByPsychologist(User psychologist);
}
