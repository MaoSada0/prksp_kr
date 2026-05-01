package com.prksp.kr.repository;

import com.prksp.kr.entity.Chat;
import com.prksp.kr.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByChatOrderByCreatedAtAsc(Chat chat);
    List<Message> findByChatId(UUID chatId);
}
