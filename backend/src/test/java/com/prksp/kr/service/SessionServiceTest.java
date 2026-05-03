package com.prksp.kr.service;

import com.prksp.kr.dto.request.CreateSessionRequest;
import com.prksp.kr.dto.request.UpdateSessionStatusRequest;
import com.prksp.kr.dto.response.SessionResponse;
import com.prksp.kr.entity.PsychologistService;
import com.prksp.kr.entity.Session;
import com.prksp.kr.entity.SessionStatus;
import com.prksp.kr.entity.TimeSlot;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistServiceRepository;
import com.prksp.kr.repository.SessionCommentRepository;
import com.prksp.kr.repository.SessionRepository;
import com.prksp.kr.repository.TimeSlotRepository;
import com.prksp.kr.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock SessionRepository sessionRepository;
    @Mock SessionCommentRepository commentRepository;
    @Mock UserRepository userRepository;
    @Mock PsychologistServiceRepository serviceRepository;
    @Mock TimeSlotRepository timeSlotRepository;

    @InjectMocks SessionService sessionService;

    private User makeClient() {
        return User.builder().id(UUID.randomUUID()).email("c@e.com")
                .firstName("Client").lastName("User").role(UserRole.CLIENT).build();
    }

    private User makePsychologist() {
        return User.builder().id(UUID.randomUUID()).email("p@e.com")
                .firstName("Psych").lastName("Doctor").role(UserRole.PSYCHOLOGIST).build();
    }

    private PsychologistService makeService(User psychologist) {
        return PsychologistService.builder()
                .id(UUID.randomUUID())
                .psychologist(psychologist)
                .name("Консультация")
                .price(BigDecimal.valueOf(1500))
                .durationMinutes(60)
                .build();
    }

    private TimeSlot makeSlot(User psychologist, boolean booked) {
        return TimeSlot.builder()
                .id(UUID.randomUUID())
                .psychologist(psychologist)
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .isBooked(booked)
                .build();
    }

    private Session makeSession(User client, User psychologist, PsychologistService svc) {
        return Session.builder()
                .id(UUID.randomUUID())
                .client(client)
                .psychologist(psychologist)
                .service(svc)
                .status(SessionStatus.SCHEDULED)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void createSession_success_booksSlot() {
        User client = makeClient();
        User psy = makePsychologist();
        PsychologistService svc = makeService(psy);
        TimeSlot slot = makeSlot(psy, false);

        CreateSessionRequest req = new CreateSessionRequest();
        req.setPsychologistId(psy.getId());
        req.setServiceId(svc.getId());
        req.setSlotId(slot.getId());

        Session saved = makeSession(client, psy, svc);

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(serviceRepository.findById(svc.getId())).thenReturn(Optional.of(svc));
        when(timeSlotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));
        when(sessionRepository.save(any())).thenReturn(saved);
        when(timeSlotRepository.save(any())).thenReturn(slot);

        SessionResponse result = sessionService.createSession(client, req);

        assertThat(result.getStatus()).isEqualTo(SessionStatus.SCHEDULED);
        assertThat(slot.getIsBooked()).isTrue();
        verify(sessionRepository).save(any());
    }

    @Test
    void createSession_byPsychologist_throws() {
        User psy = makePsychologist();
        assertThatThrownBy(() -> sessionService.createSession(psy, new CreateSessionRequest()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createSession_slotAlreadyBooked_throws() {
        User client = makeClient();
        User psy = makePsychologist();
        PsychologistService svc = makeService(psy);
        TimeSlot slot = makeSlot(psy, true);

        CreateSessionRequest req = new CreateSessionRequest();
        req.setPsychologistId(psy.getId());
        req.setServiceId(svc.getId());
        req.setSlotId(slot.getId());

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(serviceRepository.findById(svc.getId())).thenReturn(Optional.of(svc));
        when(timeSlotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> sessionService.createSession(client, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    void createSession_slotBelongsToOtherPsychologist_throws() {
        User client = makeClient();
        User psy = makePsychologist();
        User otherPsy = makePsychologist();
        PsychologistService svc = makeService(psy);
        TimeSlot slot = makeSlot(otherPsy, false);

        CreateSessionRequest req = new CreateSessionRequest();
        req.setPsychologistId(psy.getId());
        req.setServiceId(svc.getId());
        req.setSlotId(slot.getId());

        when(userRepository.findById(psy.getId())).thenReturn(Optional.of(psy));
        when(serviceRepository.findById(svc.getId())).thenReturn(Optional.of(svc));
        when(timeSlotRepository.findById(slot.getId())).thenReturn(Optional.of(slot));

        assertThatThrownBy(() -> sessionService.createSession(client, req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateStatus_inProgress_setsStartedAt() {
        User client = makeClient();
        User psy = makePsychologist();
        PsychologistService svc = makeService(psy);
        Session session = makeSession(client, psy, svc);

        UpdateSessionStatusRequest req = new UpdateSessionStatusRequest();
        req.setStatus(SessionStatus.IN_PROGRESS);

        when(sessionRepository.findById(session.getId())).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenReturn(session);

        sessionService.updateStatus(client, session.getId(), req);

        assertThat(session.getStartedAt()).isNotNull();
    }

    @Test
    void updateStatus_cancelled_freesSlotAndSetsEndedAt() {
        User client = makeClient();
        User psy = makePsychologist();
        PsychologistService svc = makeService(psy);
        Session session = makeSession(client, psy, svc);
        TimeSlot slot = makeSlot(psy, true);
        slot.setSession(session);

        UpdateSessionStatusRequest req = new UpdateSessionStatusRequest();
        req.setStatus(SessionStatus.CANCELLED);

        when(sessionRepository.findById(session.getId())).thenReturn(Optional.of(session));
        when(timeSlotRepository.findBySession(session)).thenReturn(Optional.of(slot));
        when(sessionRepository.save(any())).thenReturn(session);

        sessionService.updateStatus(client, session.getId(), req);

        assertThat(slot.getIsBooked()).isFalse();
        assertThat(slot.getSession()).isNull();
        assertThat(session.getEndedAt()).isNotNull();
    }

    @Test
    void updateStatus_byNonParticipant_throws() {
        User client = makeClient();
        User psy = makePsychologist();
        User stranger = makeClient();
        PsychologistService svc = makeService(psy);
        Session session = makeSession(client, psy, svc);

        UpdateSessionStatusRequest req = new UpdateSessionStatusRequest();
        req.setStatus(SessionStatus.CANCELLED);

        when(sessionRepository.findById(session.getId())).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.updateStatus(stranger, session.getId(), req))
                .isInstanceOf(AccessDeniedException.class);
    }
}
