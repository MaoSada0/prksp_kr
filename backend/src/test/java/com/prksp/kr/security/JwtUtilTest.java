package com.prksp.kr.security;

import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "testSecretKeyThatIsAtLeast256BitsLongForHMACSHA256Algorithm";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    private User makeUser(String email) {
        return User.builder()
                .email(email)
                .password("encoded")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.CLIENT)
                .build();
    }

    @Test
    void generateToken_returnsNonBlankToken() {
        String token = jwtUtil.generateToken(makeUser("test@example.com"));
        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_returnsEmail() {
        User user = makeUser("user@example.com");
        String token = jwtUtil.generateToken(user);
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("user@example.com");
    }

    @Test
    void validateToken_validToken_returnsTrue() {
        User user = makeUser("valid@example.com");
        String token = jwtUtil.generateToken(user);
        assertThat(jwtUtil.validateToken(token, user)).isTrue();
    }

    @Test
    void validateToken_wrongUser_returnsFalse() {
        User user1 = makeUser("user1@example.com");
        User user2 = makeUser("user2@example.com");
        String token = jwtUtil.generateToken(user1);
        assertThat(jwtUtil.validateToken(token, user2)).isFalse();
    }

    @Test
    void validateToken_expiredToken_throwsException() {
        JwtUtil expiredUtil = new JwtUtil();
        ReflectionTestUtils.setField(expiredUtil, "secret", SECRET);
        ReflectionTestUtils.setField(expiredUtil, "expiration", -1000L);
        User user = makeUser("expired@example.com");
        String token = expiredUtil.generateToken(user);
        assertThrows(Exception.class, () -> expiredUtil.validateToken(token, user));
    }

    @Test
    void extractUsername_invalidToken_throws() {
        assertThrows(Exception.class, () -> jwtUtil.extractUsername("not.a.valid.token"));
    }
}
