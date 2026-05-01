package com.prksp.kr.service;

import com.prksp.kr.dto.request.BatchCreateSlotsRequest;
import com.prksp.kr.dto.request.CreateSlotRequest;
import com.prksp.kr.dto.response.SlotResponse;
import com.prksp.kr.entity.TimeSlot;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.TimeSlotRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(UUID psychologistId, LocalDate date) {
        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.atTime(23, 59, 59);
        return timeSlotRepository
                .findByPsychologistAndIsBookedFalseAndStartTimeBetweenOrderByStartTime(psychologist, from, to)
                .stream().map(this::toSlotResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getPsychologistSchedule(User psychologist, LocalDate from, LocalDate to) {
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo = to.atTime(23, 59, 59);
        return timeSlotRepository
                .findByPsychologistAndStartTimeBetweenOrderByStartTime(psychologist, dtFrom, dtTo)
                .stream().map(this::toSlotResponse).collect(Collectors.toList());
    }

    @Transactional
    public SlotResponse createSlot(User psychologist, CreateSlotRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (timeSlotRepository.existsOverlapping(psychologist, request.getStartTime(), request.getEndTime())) {
            throw new IllegalArgumentException("Slot overlaps with an existing slot");
        }
        TimeSlot slot = TimeSlot.builder()
                .psychologist(psychologist)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        return toSlotResponse(timeSlotRepository.save(slot));
    }

    @Transactional
    public List<SlotResponse> batchCreateSlots(User psychologist, BatchCreateSlotsRequest request) {
        if (!request.getFromTime().isBefore(request.getToTime())) {
            throw new IllegalArgumentException("From time must be before to time");
        }
        List<TimeSlot> slots = new ArrayList<>();
        LocalDateTime current = request.getDate().atTime(request.getFromTime());
        LocalDateTime rangeEnd = request.getDate().atTime(request.getToTime());

        while (!current.plusMinutes(request.getSlotDurationMinutes()).isAfter(rangeEnd)) {
            LocalDateTime slotEnd = current.plusMinutes(request.getSlotDurationMinutes());
            if (!timeSlotRepository.existsOverlapping(psychologist, current, slotEnd)) {
                slots.add(TimeSlot.builder()
                        .psychologist(psychologist)
                        .startTime(current)
                        .endTime(slotEnd)
                        .build());
            }
            current = slotEnd;
        }

        if (slots.isEmpty()) {
            throw new IllegalArgumentException("No slots could be created (all overlap with existing)");
        }

        return timeSlotRepository.saveAll(slots).stream()
                .map(this::toSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSlot(User psychologist, UUID slotId) {
        TimeSlot slot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        if (!slot.getPsychologist().getId().equals(psychologist.getId())) {
            throw new AccessDeniedException("Not allowed");
        }
        if (slot.getIsBooked()) {
            throw new IllegalArgumentException("Cannot delete a booked slot");
        }
        timeSlotRepository.delete(slot);
    }

    private SlotResponse toSlotResponse(TimeSlot slot) {
        String clientName = null;
        UUID sessionId = null;
        if (slot.getSession() != null) {
            clientName = slot.getSession().getClient().getFirstName()
                    + " " + slot.getSession().getClient().getLastName();
            sessionId = slot.getSession().getId();
        }
        return SlotResponse.builder()
                .id(slot.getId())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .isBooked(slot.getIsBooked())
                .sessionId(sessionId)
                .clientName(clientName)
                .build();
    }
}
