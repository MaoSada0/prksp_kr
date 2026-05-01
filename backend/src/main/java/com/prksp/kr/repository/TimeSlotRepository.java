package com.prksp.kr.repository;

import com.prksp.kr.entity.Session;
import com.prksp.kr.entity.TimeSlot;
import com.prksp.kr.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {

    List<TimeSlot> findByPsychologistAndIsBookedFalseAndStartTimeBetweenOrderByStartTime(
            User psychologist, LocalDateTime from, LocalDateTime to);

    List<TimeSlot> findByPsychologistAndStartTimeBetweenOrderByStartTime(
            User psychologist, LocalDateTime from, LocalDateTime to);

    Optional<TimeSlot> findBySession(Session session);

    @Query("SELECT COUNT(t) > 0 FROM TimeSlot t WHERE t.psychologist = :psychologist " +
            "AND t.startTime < :endTime AND t.endTime > :startTime")
    boolean existsOverlapping(@Param("psychologist") User psychologist,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);
}
