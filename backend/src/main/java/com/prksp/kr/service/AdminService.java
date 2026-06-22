package com.prksp.kr.service;

import com.prksp.kr.dto.request.ChangeRoleRequest;
import com.prksp.kr.dto.response.AdminStatsResponse;
import com.prksp.kr.dto.response.UserSummaryResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.ReviewRepository;
import com.prksp.kr.repository.SessionRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryResponse changeUserRole(UUID userId, ChangeRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setRole(request.getRole());
        return toSummary(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Пользователь не найден");
        }
        userRepository.deleteById(userId);
    }

    public AdminStatsResponse getStats() {
        List<User> allUsers = userRepository.findAll();
        return AdminStatsResponse.builder()
                .totalUsers(allUsers.size())
                .clients(allUsers.stream().filter(u -> u.getRole() == UserRole.CLIENT).count())
                .psychologists(allUsers.stream().filter(u -> u.getRole() == UserRole.PSYCHOLOGIST).count())
                .admins(allUsers.stream().filter(u -> u.getRole() == UserRole.ADMIN).count())
                .totalSessions(sessionRepository.count())
                .totalReviews(reviewRepository.count())
                .build();
    }

    private UserSummaryResponse toSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .photoUrl(user.getPhotoUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
