package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.MessageRequest;
import org.example.backend.dto.MessageResponse;
import org.example.backend.dto.MessageUpdateRequest;
import org.example.backend.exceptions.NotFoundException;
import org.example.backend.model.Message;
import org.example.backend.repos.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatService chatService;

    @Transactional
    public MessageResponse createMessage(MessageRequest request, Long currentUserId) {
        chatService.getOwnedChat(request.chatId(), currentUserId);

        Message message = new Message();
        message.setChatId(request.chatId());
        message.setIsOutgoing(request.isOutgoing());
        message.setMessageText(request.messageText());
        message.setDangerLevel(request.dangerLevel());
        return MessageResponse.from(messageRepository.save(message));
    }

    @Transactional
    public MessageResponse updateMessage(Long id, MessageUpdateRequest request, Long currentUserId) {
        Message message = getOwnedMessage(id, currentUserId);
        message.setIsOutgoing(request.isOutgoing());
        message.setMessageText(request.messageText());
        return MessageResponse.from(message);
    }

    @Transactional(readOnly = true)
    public MessageResponse getMessage(Long id, Long currentUserId) {
        return MessageResponse.from(getOwnedMessage(id, currentUserId));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByChatId(Long chatId, Long currentUserId) {
        chatService.getOwnedChat(chatId, currentUserId);
        return messageRepository.findByChatIdOrderBySentAtAscIdAsc(chatId).stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional
    public void deleteMessage(Long id, Long currentUserId) {
        messageRepository.delete(getOwnedMessage(id, currentUserId));
    }

    private Message getOwnedMessage(Long id, Long currentUserId) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found"));
        try {
            chatService.getOwnedChat(message.getChatId(), currentUserId);
        } catch (NotFoundException e) {
            throw new NotFoundException("Message not found");
        }
        return message;
    }
}
