package com.prksp.kr.controller;

import com.prksp.kr.dto.request.UpdateUserRequest;
import com.prksp.kr.dto.response.AuthResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(toResponse(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse> updateMe(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateUserRequest request) {
        currentUser.setFirstName(request.getFirstName());
        currentUser.setLastName(request.getLastName());
        User saved = userRepository.save(currentUser);
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthResponse> getUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    private AuthResponse toResponse(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .photoUrl(user.getPhotoUrl())
                .build();
    }
}
