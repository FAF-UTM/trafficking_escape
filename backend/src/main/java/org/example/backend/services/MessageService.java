package org.example.backend.services;

import org.example.backend.dto.MessageDTO;
import org.example.backend.model.Message;
import org.example.backend.converters.MessageConverter;
import org.example.backend.repos.MessageRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final MessageConverter messageConverter;

    public MessageService(MessageRepository messageRepository, MessageConverter messageConverter) {
        this.messageRepository = messageRepository;
        this.messageConverter = messageConverter;
    }

    public MessageDTO createMessage(MessageDTO messageDTO, Long currentUserId) {
        // Convert DTO to entity.
        Message message = messageConverter.toEntity(messageDTO);
        // Ensure that the parent chat belongs to the logged-in user.
        if (!message.getChat().getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own the chat for this message.");
        }
        message = messageRepository.save(message);
        return messageConverter.toDTO(message);
    }

    public MessageDTO updateMessage(Long id, MessageDTO messageDTO, Long currentUserId) {
        Message existingMessage = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!existingMessage.getChat().getUser().getId().equals(currentUserId)) {
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

        if (!message.getChat().getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this message.");
        }
        return messageConverter.toDTO(message);
    }

    public List<MessageDTO> getMessagesByChatId(Long chatId, Long currentUserId) {
        List<Message> messages = messageRepository.findByChatId(chatId);
        if (!messages.isEmpty()) {
            // Check the owner using the first message's chat.
            if (!messages.get(0).getChat().getUser().getId().equals(currentUserId)) {
                throw new AccessDeniedException("You do not own these messages.");
            }
        }
        return messages.stream().map(messageConverter::toDTO).collect(Collectors.toList());
    }

    public void deleteMessage(Long id, Long currentUserId) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getChat().getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this message.");
        }
        messageRepository.deleteById(id);
    }
}
