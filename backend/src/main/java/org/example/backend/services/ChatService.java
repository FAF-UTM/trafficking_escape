package org.example.backend.services;

import org.example.backend.dto.ChatDTO;
import org.example.backend.model.Chat;
import org.example.backend.converters.ChatConverter;
import org.example.backend.repos.ChatRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatConverter chatConverter;

    public ChatService(ChatRepository chatRepository, ChatConverter chatConverter) {
        this.chatRepository = chatRepository;
        this.chatConverter = chatConverter;
    }

    public ChatDTO createChat(ChatDTO chatDTO, Long currentUserId) {
        // Set the logged-in user as the owner of the chat.
        chatDTO.setUserId(currentUserId);
        Chat chat = chatConverter.toEntity(chatDTO);
        chat = chatRepository.save(chat);
        return chatConverter.toDTO(chat);
    }

    public ChatDTO updateChat(Long id, ChatDTO chatDTO, Long currentUserId) {
        Chat existingChat = chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!existingChat.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this chat.");
        }

        // Update allowed fields.
        existingChat.setChatImageUrl(chatDTO.getChatImageUrl());
        existingChat.setChatName(chatDTO.getChatName());
        existingChat.setIsTrafficker(chatDTO.getIsTrafficker());
        chatRepository.save(existingChat);
        return chatConverter.toDTO(existingChat);
    }

    public ChatDTO getChatById(Long id, Long currentUserId) {
        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!chat.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this chat.");
        }

        return chatConverter.toDTO(chat);
    }

    public List<ChatDTO> getChatsByUserId(Long userId, Long currentUserId) {
        // Only allow a user to retrieve their own chats.
        if (!currentUserId.equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access these chats.");
        }
        List<Chat> chats = chatRepository.findByUserId(userId);
        return chats.stream().map(chatConverter::toDTO).collect(Collectors.toList());
    }

    public void deleteChat(Long id, Long currentUserId) {
        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!chat.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this chat.");
        }

        chatRepository.deleteById(id);
    }
}
