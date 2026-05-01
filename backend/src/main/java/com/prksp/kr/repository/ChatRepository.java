package com.prksp.kr.repository;

import com.prksp.kr.entity.Chat;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, UUID> {
    List<Chat> findByClientOrPsychologist(User client, User psychologist);
    Optional<Chat> findByClientAndPsychologist(User client, User psychologist);
}
