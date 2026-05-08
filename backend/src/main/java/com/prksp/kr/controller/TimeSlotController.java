package com.prksp.kr.controller;

import com.prksp.kr.dto.request.BatchCreateSlotsRequest;
import com.prksp.kr.dto.request.CreateSlotRequest;
import com.prksp.kr.dto.response.SlotResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.TimeSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Slots", description = "Временные слоты психолога")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @GetMapping("/psychologists/{id}/slots")
    @Operation(summary = "Свободные слоты психолога на дату (?date=YYYY-MM-DD)")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(timeSlotService.getAvailableSlots(id, date));
    }

    @GetMapping("/psychologists/me/schedule")
    @Operation(summary = "Расписание психолога (?from=YYYY-MM-DD&to=YYYY-MM-DD)")
    public ResponseEntity<List<SlotResponse>> getSchedule(
            @AuthenticationPrincipal User currentUser,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(timeSlotService.getPsychologistSchedule(currentUser, from, to));
    }

    @PostMapping("/psychologists/me/slots")
    @Operation(summary = "Создать один слот (психолог)")
    public ResponseEntity<SlotResponse> createSlot(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timeSlotService.createSlot(currentUser, request));
    }

    @PostMapping("/psychologists/me/slots/batch")
    @Operation(summary = "Пакетное создание слотов по диапазону времени (психолог)")
    public ResponseEntity<List<SlotResponse>> batchCreateSlots(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BatchCreateSlotsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timeSlotService.batchCreateSlots(currentUser, request));
    }

    @DeleteMapping("/psychologists/me/slots/{slotId}")
    @Operation(summary = "Удалить незабронированный слот (психолог)")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID slotId) {
        timeSlotService.deleteSlot(currentUser, slotId);
        return ResponseEntity.noContent().build();
    }
}
