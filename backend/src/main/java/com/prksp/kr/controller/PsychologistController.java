package com.prksp.kr.controller;

import com.prksp.kr.dto.request.CreateServiceRequest;
import com.prksp.kr.dto.request.UpdateProfileRequest;
import com.prksp.kr.dto.response.PsychologistResponse;
import com.prksp.kr.dto.response.ServiceResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.service.PsychologistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/psychologists")
@RequiredArgsConstructor
@Tag(name = "Psychologists", description = "Психологи, их профили и услуги")
public class PsychologistController {

    private final PsychologistService psychologistService;

    @GetMapping
    @Operation(summary = "Список психологов", description = "Опциональный поиск по имени/фамилии через ?search=")
    public ResponseEntity<List<PsychologistResponse>> getAll(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(psychologistService.getAllPsychologists(search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Профиль психолога по ID")
    public ResponseEntity<PsychologistResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(psychologistService.getPsychologistById(id));
    }

    @PutMapping("/me/profile")
    @Operation(summary = "Обновить профиль психолога (bio, education, experienceYears)")
    public ResponseEntity<PsychologistResponse> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(psychologistService.updateProfile(currentUser, request));
    }

    @GetMapping("/{id}/services")
    @Operation(summary = "Услуги психолога")
    public ResponseEntity<List<ServiceResponse>> getServices(@PathVariable UUID id) {
        return ResponseEntity.ok(psychologistService.getServices(id));
    }

    @PostMapping("/me/services")
    @Operation(summary = "Создать услугу (только для психолога)")
    public ResponseEntity<ServiceResponse> createService(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(psychologistService.createService(currentUser, request));
    }

    @DeleteMapping("/me/services/{serviceId}")
    @Operation(summary = "Удалить услугу (только свою)")
    public ResponseEntity<Void> deleteService(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID serviceId) {
        psychologistService.deleteService(currentUser, serviceId);
        return ResponseEntity.noContent().build();
    }
}
