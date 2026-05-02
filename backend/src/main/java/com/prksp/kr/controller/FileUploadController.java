package com.prksp.kr.controller;

import com.prksp.kr.dto.response.AuthResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistProfileRepository;
import com.prksp.kr.repository.UserRepository;
import com.prksp.kr.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final PsychologistProfileRepository profileRepository;

    @PostMapping("/avatar")
    public ResponseEntity<AuthResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().build();
        }

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase()
                : "jpg";
        String key = "avatars/" + currentUser.getId() + "." + ext;

        String url = s3Service.upload(key, file.getBytes(), contentType);

        currentUser.setPhotoUrl(url);
        User saved = userRepository.save(currentUser);

        if (currentUser.getRole() == UserRole.PSYCHOLOGIST) {
            profileRepository.findByUser(currentUser).ifPresent(profile -> {
                profile.setPhotoUrl(url);
                profileRepository.save(profile);
            });
        }

        return ResponseEntity.ok(AuthResponse.builder()
                .userId(saved.getId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole())
                .photoUrl(saved.getPhotoUrl())
                .build());
    }
}
