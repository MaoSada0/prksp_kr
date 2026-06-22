package com.prksp.kr.fuzz;

import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.security.JwtUtil;
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import net.jqwik.api.lifecycle.BeforeProperty;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeFalse;

class JwtFuzzTest {

    private static final String SECRET =
            "testSecretKeyThatIsAtLeast256BitsLongForHMACSHA256Algorithm";

    private JwtUtil jwtUtil;

    @BeforeProperty
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    /**
     * Произвольная строка, не являющаяся корректным JWT (формат header.payload.sig),
     * должна вызывать исключение при попытке извлечь username.
     */
    @Property(tries = 500)
    @Label("Произвольная строка не является валидным JWT и вызывает исключение")
    void arbitraryString_notValidJwt_alwaysThrows(@ForAll String randomInput) {
        assumeFalse(
                randomInput.matches("^[A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_]+\\.[A-Za-z0-9\\-_]+$"),
                "Пропускаем случайную строку, похожую на JWT по формату"
        );
        assertThatThrownBy(() -> jwtUtil.extractUsername(randomInput))
                .isInstanceOf(Exception.class);
    }

    /**
     * Для любого валидного email генерируется токен, из которого извлекается
     * ровно тот же email (round-trip).
     */
    @Property(tries = 300)
    @Label("Токен генерируется и корректно парсится для произвольного email")
    void validEmail_generatesToken_roundTripCorrect(@ForAll("validEmails") String email) {
        User user = buildUser(email);
        String token = jwtUtil.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo(email);
        assertThat(jwtUtil.validateToken(token, user)).isTrue();
    }

    /**
     * Замена сегмента подписи (третья часть JWT) на фиктивное значение
     * всегда приводит к ошибке верификации HMAC.
     *
     * Примечание: JJWT 0.12.5 является LENIENT к мусору, добавленному ПОСЛЕ токена —
     * он игнорирует trailing-символы. Поэтому тест корректирует саму подпись, а не
     * дописывает символы в конец строки.
     */
    @Property(tries = 300)
    @Label("Токен с подделанной подписью всегда отклоняется верификатором")
    void tokenWithFakeSignature_alwaysRejected(@ForAll("validEmails") String email) {
        User user = buildUser(email);
        String token = jwtUtil.generateToken(user);
        int lastDot = token.lastIndexOf('.');
        // Подменяем весь сегмент подписи — HMAC-верификация гарантированно провалится
        String tampered = token.substring(0, lastDot + 1) + "dGhpc2lzZmFrZXNpZ25hdHVyZQ";

        assertThatThrownBy(() -> jwtUtil.extractUsername(tampered))
                .isInstanceOf(Exception.class);
    }

    /**
     * Токен пользователя A не проходит валидацию для пользователя B.
     */
    @Property(tries = 300)
    @Label("Токен одного пользователя не валиден для другого")
    void token_doesNotValidateForDifferentUser(
            @ForAll("validEmails") String email1,
            @ForAll("validEmails") String email2) {
        assumeFalse(email1.equals(email2), "Оба email одинаковые — пропуск");

        User user1 = buildUser(email1);
        User user2 = buildUser(email2);
        String token = jwtUtil.generateToken(user1);

        assertThat(jwtUtil.validateToken(token, user2)).isFalse();
    }

    /**
     * Пустая строка всегда вызывает исключение.
     */
    @Example
    @Label("Пустая строка как токен всегда вызывает исключение")
    void emptyString_alwaysThrows() {
        assertThatThrownBy(() -> jwtUtil.extractUsername(""))
                .isInstanceOf(Exception.class);
    }

    /**
     * Строка из только точек (граничный случай формата JWT) вызывает исключение.
     */
    @Example
    @Label("Строка из точек не является валидным JWT")
    void dotsOnly_alwaysThrows() {
        assertThatThrownBy(() -> jwtUtil.extractUsername(".."))
                .isInstanceOf(Exception.class);
    }

    @Provide
    Arbitrary<String> validEmails() {
        return Arbitraries.strings()
                .alpha()
                .ofMinLength(2)
                .ofMaxLength(15)
                .map(local -> local.toLowerCase() + "@example.com");
    }

    private User buildUser(String email) {
        return User.builder()
                .email(email)
                .password("encoded")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.CLIENT)
                .build();
    }
}
