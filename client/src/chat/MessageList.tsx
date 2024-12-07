// MessageList.tsx
import React, { useEffect, useRef } from 'react';

interface Message {
    id: number;
    user: string;
    text: string;
    timestamp: string;
}

interface MessageListProps {
    messages: Message[];
    currentUser: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div style={styles.container}>
            {messages.map(msg => {
                const isCurrentUser = msg.user === currentUser;
                return (
                    <div
                        key={msg.id}
                        style={{
                            ...styles.messageBubble,
                            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                            backgroundColor: isCurrentUser ? '#d1e7dd' : '#f8f9fa',
                            color: '#212529',
                        }}
                    >
                        {!isCurrentUser && <div style={styles.userName}>{msg.user}</div>}
                        <div style={styles.text}>{msg.text}</div>
                        <div style={styles.timestamp}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f1f3f5',
    },
    messageBubble: {
        maxWidth: '60%',
        padding: '10px 15px',
        borderRadius: '20px',
        marginBottom: '15px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    userName: {
        marginBottom: '5px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#495057',
    },
    text: {
        fontSize: '1rem',
        lineHeight: '1.4',
    },
    timestamp: {
        marginTop: '5px',
        fontSize: '0.75rem',
        color: '#6c757d',
        textAlign: 'right',
    },
};
