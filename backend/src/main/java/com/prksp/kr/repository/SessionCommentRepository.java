package com.prksp.kr.repository;

import com.prksp.kr.entity.Session;
import com.prksp.kr.entity.SessionComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionCommentRepository extends JpaRepository<SessionComment, UUID> {
    List<SessionComment> findBySessionOrderByCreatedAtAsc(Session session);
}
