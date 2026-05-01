package com.prksp.kr.repository;

import com.prksp.kr.entity.PsychologistProfile;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PsychologistProfileRepository extends JpaRepository<PsychologistProfile, UUID> {
    Optional<PsychologistProfile> findByUser(User user);
    Optional<PsychologistProfile> findByUserId(UUID userId);
}
