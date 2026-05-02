package com.prksp.kr.service;

import com.prksp.kr.dto.request.SendMessageRequest;
import com.prksp.kr.dto.response.ChatResponse;
import com.prksp.kr.dto.response.MessageResponse;
import com.prksp.kr.entity.Chat;
import com.prksp.kr.entity.Message;
import com.prksp.kr.entity.User;
import com.prksp.kr.entity.UserRole;
import com.prksp.kr.repository.ChatRepository;
import com.prksp.kr.repository.MessageRepository;
import com.prksp.kr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ChatResponse> getUserChats(User user) {
        List<Chat> chats = chatRepository.findByClientOrPsychologist(user, user);
        return chats.stream().map(this::toChatResponse).collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse getOrCreateChat(User currentUser, UUID psychologistId) {
        User psychologist = userRepository.findById(psychologistId)
                .orElseThrow(() -> new IllegalArgumentException("Psychologist not found"));

        if (psychologist.getRole() != UserRole.PSYCHOLOGIST) {
            throw new IllegalArgumentException("User is not a psychologist");
        }

        User client = currentUser.getRole() == UserRole.CLIENT ? currentUser : null;
        if (client == null) {
            throw new AccessDeniedException("Only clients can initiate chats");
        }

        Chat chat = chatRepository.findByClientAndPsychologist(client, psychologist)
                .orElseGet(() -> {
                    Chat newChat = Chat.builder()
                            .client(client)
                            .psychologist(psychologist)
                            .build();
                    return chatRepository.save(newChat);
                });

        return toChatResponse(chat);
    }

    public List<MessageResponse> getChatMessages(User currentUser, UUID chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        validateChatAccess(currentUser, chat);
        return messageRepository.findByChatOrderByCreatedAtAsc(chat).stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(User sender, UUID chatId, SendMessageRequest request) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        validateChatAccess(sender, chat);

        Message message = Message.builder()
                .chat(chat)
                .sender(sender)
                .content(request.getContent())
                .type(request.getType())
                .build();

        Message saved = messageRepository.save(message);
        MessageResponse response = toMessageResponse(saved);

        messagingTemplate.convertAndSend("/topic/chat." + chatId, response);

        return response;
    }

    private void validateChatAccess(User user, Chat chat) {
        boolean isParticipant = chat.getClient().getId().equals(user.getId())
                || chat.getPsychologist().getId().equals(user.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("No access to this chat");
        }
    }

    private ChatResponse toChatResponse(Chat chat) {
        List<Message> messages = messageRepository.findByChatId(chat.getId());
        MessageResponse lastMessage = messages.isEmpty() ? null
                : toMessageResponse(messages.get(messages.size() - 1));

        return ChatResponse.builder()
                .id(chat.getId())
                .clientId(chat.getClient().getId())
                .clientName(chat.getClient().getFirstName() + " " + chat.getClient().getLastName())
                .clientPhotoUrl(chat.getClient().getPhotoUrl())
                .psychologistId(chat.getPsychologist().getId())
                .psychologistName(chat.getPsychologist().getFirstName() + " " + chat.getPsychologist().getLastName())
                .psychologistPhotoUrl(chat.getPsychologist().getPhotoUrl())
                .createdAt(chat.getCreatedAt())
                .lastMessage(lastMessage)
                .build();
    }

    private MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .content(message.getContent())
                .type(message.getType())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
