package com.prksp.kr.repository;

import com.prksp.kr.entity.PsychologistService;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PsychologistServiceRepository extends JpaRepository<PsychologistService, UUID> {
    List<PsychologistService> findByPsychologistAndIsActiveTrue(User psychologist);
    List<PsychologistService> findByPsychologistId(UUID psychologistId);
}
