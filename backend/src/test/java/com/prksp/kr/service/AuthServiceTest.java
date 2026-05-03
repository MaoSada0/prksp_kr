package com.prksp.kr.service;

import com.prksp.kr.dto.request.LoginRequest;
import com.prksp.kr.dto.request.RegisterRequest;
import com.prksp.kr.dto.response.AuthResponse;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistProfileRepository;
import com.prksp.kr.repository.UserRepository;
import com.prksp.kr.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PsychologistProfileRepository psychologistProfileRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    private RegisterRequest makeRegisterRequest(UserRole role) {
        RegisterRequest r = new RegisterRequest();
        r.setEmail("test@example.com");
        r.setPassword("password123");
        r.setFirstName("Ivan");
        r.setLastName("Petrov");
        r.setRole(role);
        return r;
    }

    private User makeUser(UUID id, UserRole role) {
        return User.builder()
                .id(id)
                .email("test@example.com")
                .password("encoded")
                .firstName("Ivan")
                .lastName("Petrov")
                .role(role)
                .build();
    }

    @Test
    void register_client_returnsToken() {
        RegisterRequest req = makeRegisterRequest(UserRole.CLIENT);
        User saved = makeUser(UUID.randomUUID(), UserRole.CLIENT);

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(saved);
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo(UserRole.CLIENT);
        verify(psychologistProfileRepository, never()).save(any());
    }

    @Test
    void register_psychologist_createsProfile() {
        RegisterRequest req = makeRegisterRequest(UserRole.PSYCHOLOGIST);
        User saved = makeUser(UUID.randomUUID(), UserRole.PSYCHOLOGIST);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(saved);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        authService.register(req);

        verify(psychologistProfileRepository).save(any());
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest req = makeRegisterRequest(UserRole.CLIENT);
        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void login_success_returnsToken() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        User user = makeUser(UUID.randomUUID(), UserRole.CLIENT);
        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_userNotFound_throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@example.com");
        req.setPassword("pass");

        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
