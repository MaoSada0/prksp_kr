package com.prksp.kr.service;

import com.prksp.kr.dto.request.CreateCommentRequest;
import com.prksp.kr.dto.request.CreateSessionRequest;
import com.prksp.kr.dto.request.UpdateSessionStatusRequest;
import com.prksp.kr.dto.response.CommentResponse;
import com.prksp.kr.dto.response.SessionResponse;
import com.prksp.kr.entity.PsychologistService;
import com.prksp.kr.entity.Session;
import com.prksp.kr.entity.SessionComment;
import com.prksp.kr.entity.SessionStatus;
import com.prksp.kr.entity.TimeSlot;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistServiceRepository;
import com.prksp.kr.repository.SessionCommentRepository;
import com.prksp.kr.repository.SessionRepository;
import com.prksp.kr.repository.TimeSlotRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PsychologistServiceRepository serviceRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Transactional
    public SessionResponse createSession(User client, CreateSessionRequest request) {
        if (client.getRole() != UserRole.CLIENT) {
            throw new AccessDeniedException("Only clients can create sessions");
        }

        User psychologist = userRepository.findById(request.getPsychologistId())
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));

        PsychologistService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));

        if (!service.getPsychologist().getId().equals(psychologist.getId())) {
            throw new IllegalArgumentException("Service does not belong to psychologist");
        }

        TimeSlot slot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (slot.getIsBooked()) {
            throw new IllegalArgumentException("This slot is already booked");
        }

        if (!slot.getPsychologist().getId().equals(psychologist.getId())) {
            throw new IllegalArgumentException("Slot does not belong to this psychologist");
        }

        Session session = Session.builder()
                .client(client)
                .psychologist(psychologist)
                .service(service)
                .scheduledAt(slot.getStartTime())
                .meetingLink(request.getMeetingLink())
                .build();

        Session saved = sessionRepository.save(session);

        slot.setIsBooked(true);
        slot.setSession(saved);
        timeSlotRepository.save(slot);

        return toSessionResponse(saved);
    }

    public List<SessionResponse> getUserSessions(User user) {
        List<Session> sessions;
        if (user.getRole() == UserRole.CLIENT) {
            sessions = sessionRepository.findByClientOrderByScheduledAtDesc(user);
        } else {
            sessions = sessionRepository.findByPsychologistOrderByScheduledAtDesc(user);
        }
        return sessions.stream().map(this::toSessionResponse).collect(Collectors.toList());
    }

    public SessionResponse getSession(User user, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        validateSessionAccess(user, session);
        return toSessionResponse(session);
    }

    @Transactional
    public SessionResponse updateStatus(User user, UUID sessionId, UpdateSessionStatusRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        validateSessionAccess(user, session);

        session.setStatus(request.getStatus());
        if (request.getMeetingLink() != null) {
            session.setMeetingLink(request.getMeetingLink());
        }
        if (request.getStatus() == SessionStatus.IN_PROGRESS) {
            session.setStartedAt(LocalDateTime.now());
        }
        if (request.getStatus() == SessionStatus.COMPLETED || request.getStatus() == SessionStatus.CANCELLED) {
            session.setEndedAt(LocalDateTime.now());
        }
        if (request.getStatus() == SessionStatus.CANCELLED) {
            timeSlotRepository.findBySession(session).ifPresent(slot -> {
                slot.setIsBooked(false);
                slot.setSession(null);
                timeSlotRepository.save(slot);
            });
        }

        return toSessionResponse(sessionRepository.save(session));
    }

    public List<CommentResponse> getComments(User user, UUID sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        validateSessionAccess(user, session);
        return commentRepository.findBySessionOrderByCreatedAtAsc(session).stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addComment(User author, UUID sessionId, CreateCommentRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        validateSessionAccess(author, session);

        SessionComment comment = SessionComment.builder()
                .session(session)
                .author(author)
                .content(request.getContent())
                .build();

        return toCommentResponse(commentRepository.save(comment));
    }

    private void validateSessionAccess(User user, Session session) {
        boolean isParticipant = session.getClient().getId().equals(user.getId())
                || session.getPsychologist().getId().equals(user.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("No access to this session");
        }
    }

    private SessionResponse toSessionResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .clientId(session.getClient().getId())
                .clientName(session.getClient().getFirstName() + " " + session.getClient().getLastName())
                .psychologistId(session.getPsychologist().getId())
                .psychologistName(session.getPsychologist().getFirstName() + " " + session.getPsychologist().getLastName())
                .serviceId(session.getService().getId())
                .serviceName(session.getService().getName())
                .serviceDurationMinutes(session.getService().getDurationMinutes())
                .status(session.getStatus())
                .scheduledAt(session.getScheduledAt())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .meetingLink(session.getMeetingLink())
                .createdAt(session.getCreatedAt())
                .build();
    }

    private CommentResponse toCommentResponse(SessionComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .sessionId(comment.getSession().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName())
                .authorRole(comment.getAuthor().getRole())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
