package org.example.backend.services;

import org.example.backend.dto.MessageDTO;
import org.example.backend.model.Chat;
import org.example.backend.model.Message;
import org.example.backend.converters.MessageConverter;
import org.example.backend.repos.ChatRepository;
import org.example.backend.repos.MessageRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageConverter messageConverter;
    private final ChatRepository chatRepository;

    public MessageService(MessageRepository messageRepository,
                          MessageConverter messageConverter,
                          ChatRepository chatRepository) {
        this.messageRepository = messageRepository;
        this.messageConverter = messageConverter;
        this.chatRepository = chatRepository;
    }

    public MessageDTO createMessage(MessageDTO messageDTO, Long currentUserId) {
        Message message = messageConverter.toEntity(messageDTO);
        // Retrieve the Chat entity based on chatId
        Chat chat = chatRepository.findById(message.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        if (!chat.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own the chat for this message.");
        }
        message = messageRepository.save(message);
        return messageConverter.toDTO(message);
    }

    public MessageDTO updateMessage(Long id, MessageDTO messageDTO, Long currentUserId) {
        Message existingMessage = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Chat chat = chatRepository.findById(existingMessage.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        if (!chat.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this message.");
        }
        // Update allowed fields.
        existingMessage.setIsOutgoing(messageDTO.getIsOutgoing());
        existingMessage.setMessageText(messageDTO.getMessageText());
        messageRepository.save(existingMessage);
        return messageConverter.toDTO(existingMessage);
    }

    public MessageDTO getMessageById(Long id, Long currentUserId) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Chat chat = chatRepository.findById(message.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        if (!chat.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this message.");
        }
        return messageConverter.toDTO(message);
    }

    public List<MessageDTO> getMessagesByChatId(Long chatId, Long currentUserId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        if (!chat.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own these messages.");
        }
        List<Message> messages = messageRepository.findByChatId(chatId);
        return messages.stream().map(messageConverter::toDTO).collect(Collectors.toList());
    }

    public void deleteMessage(Long id, Long currentUserId) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        Chat chat = chatRepository.findById(message.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        if (!chat.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this message.");
        }
        messageRepository.deleteById(id);
    }
}
