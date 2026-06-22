package com.prksp.kr.fuzz;

import com.prksp.kr.dto.request.RegisterRequest;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.PsychologistProfileRepository;
import com.prksp.kr.repository.UserRepository;
import com.prksp.kr.security.JwtUtil;
import com.prksp.kr.service.AuthService;
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import net.jqwik.api.lifecycle.BeforeProperty;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.clearInvocations;

class AuthServiceFuzzTest {

    private UserRepository userRepository;
    private PsychologistProfileRepository psychologistProfileRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthenticationManager authenticationManager;
    private AuthService authService;

    @BeforeProperty
    void setUp() {
        userRepository = mock(UserRepository.class);
        psychologistProfileRepository = mock(PsychologistProfileRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtil = mock(JwtUtil.class);
        authenticationManager = mock(AuthenticationManager.class);
        authService = new AuthService(
                userRepository, psychologistProfileRepository,
                passwordEncoder, jwtUtil, authenticationManager);
    }

    /**
     * Если email уже занят, метод register() ВСЕГДА выбрасывает IllegalArgumentException
     * независимо от содержимого остальных полей запроса.
     */
    @Property(tries = 500)
    @Label("Дублирующийся email всегда вызывает исключение при любых данных")
    void register_existingEmail_alwaysThrows(
            @ForAll @StringLength(min = 1, max = 100) String firstName,
            @ForAll @StringLength(min = 1, max = 100) String lastName,
            @ForAll @StringLength(min = 6, max = 500) String password) {

        when(userRepository.existsByEmail(any())).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("taken@example.com");
        req.setPassword(password);
        req.setFirstName(firstName);
        req.setLastName(lastName);
        req.setRole(UserRole.CLIENT);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");
    }

    /**
     * Произвольные символы Unicode в полях firstName/lastName не вызывают
     * неожиданных исключений — сервис должен принимать любые строки.
     * (Валидация @NotBlank и @Size применяется только на уровне контроллера.)
     */
    @Property(tries = 300)
    @Label("Произвольные Unicode-имена принимаются без NPE или неожиданных исключений")
    void register_unicodeNames_noCrash(
            @ForAll @StringLength(min = 1, max = 100) String firstName,
            @ForAll @StringLength(min = 1, max = 100) String lastName) {

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("encoded")
                .firstName(firstName)
                .lastName(lastName)
                .role(UserRole.CLIENT)
                .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token");

        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        req.setFirstName(firstName);
        req.setLastName(lastName);
        req.setRole(UserRole.CLIENT);

        var response = authService.register(req);
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    /**
     * Пароли экстремально большой длины должны передаваться в passwordEncoder
     * без сбоев сервисного уровня (независимо от поведения конкретного кодировщика).
     *
     * Важно: @BeforeProperty создаёт моки один раз на весь @Property, а не перед
     * каждой попыткой. clearInvocations() в начале каждой попытки сбрасывает счётчик
     * вызовов, иначе verify(..., times(1)) сломается начиная со второй попытки.
     */
    @Property(tries = 200)
    @Label("Пароли произвольной длины передаются в кодировщик без исключений сервиса")
    void register_extremePasswordLength_delegatesToEncoder(
            @ForAll @StringLength(min = 6, max = 10_000) String password) {

        clearInvocations(passwordEncoder);

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("pw@example.com")
                .password("encoded")
                .firstName("A")
                .lastName("B")
                .role(UserRole.CLIENT)
                .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        RegisterRequest req = new RegisterRequest();
        req.setEmail("pw@example.com");
        req.setPassword(password);
        req.setFirstName("A");
        req.setLastName("B");
        req.setRole(UserRole.CLIENT);

        var response = authService.register(req);
        assertThat(response).isNotNull();
        // Убеждаемся, что сервис передал исходный пароль (без обрезки) в кодировщик
        verify(passwordEncoder).encode(password);
    }

    /**
     * Регистрация психолога всегда создаёт профиль психолога, независимо
     * от конкретных значений полей запроса.
     */
    @Property(tries = 200)
    @Label("Регистрация психолога всегда создаёт PsychologistProfile")
    void register_psychologistRole_alwaysCreatesProfile(
            @ForAll @StringLength(min = 1, max = 50) String firstName,
            @ForAll @StringLength(min = 1, max = 50) String lastName) {

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email("psy@example.com")
                .password("encoded")
                .firstName(firstName)
                .lastName(lastName)
                .role(UserRole.PSYCHOLOGIST)
                .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        RegisterRequest req = new RegisterRequest();
        req.setEmail("psy@example.com");
        req.setPassword("password123");
        req.setFirstName(firstName);
        req.setLastName(lastName);
        req.setRole(UserRole.PSYCHOLOGIST);

        authService.register(req);

        verify(psychologistProfileRepository, atLeastOnce()).save(any());
    }
}
