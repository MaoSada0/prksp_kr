package com.prksp.kr.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new MessagingException("Missing Authorization header");
        }

        String jwt = authHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(jwt);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtUtil.validateToken(jwt, userDetails)) {
                throw new MessagingException("Invalid JWT token");
            }
            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            ));
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            throw new MessagingException("WebSocket authentication failed");
        }

        return message;
    }
}
