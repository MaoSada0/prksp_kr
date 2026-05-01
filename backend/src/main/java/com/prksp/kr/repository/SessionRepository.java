package com.prksp.kr.repository;

import com.prksp.kr.entity.Session;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByClientOrderByScheduledAtDesc(User client);
    List<Session> findByPsychologistOrderByScheduledAtDesc(User psychologist);
}
