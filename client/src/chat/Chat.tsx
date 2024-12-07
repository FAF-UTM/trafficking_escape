// Chat.tsx
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string; // ISO string
}

// Replace with your actual API endpoint
const API_MESSAGES_ENDPOINT = '/api/messages';

// Dummy list of users (could also come from backend)
const USERS = ["Alice", "Bob", "Charlie", "David", "Eve"];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(USERS[0]);

  useEffect(() => {
    // Fetch initial messages from the backend
    const fetchMessages = async () => {
      try {
        const response = await fetch(API_MESSAGES_ENDPOINT);
        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.statusText}`);
        }
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, []);

  // Function to handle sending a new message
  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      user: selectedUser,
      text,
      timestamp: new Date().toISOString(),
    };

    try {
      // Send the new message to the backend
      const response = await fetch(API_MESSAGES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }

      // Update local state with the new message
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div style={styles.container}>
        <Sidebar
            users={USERS}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
        />
        <div style={styles.chatArea}>
          <div style={styles.header}>
            <h2>{selectedUser}'s Chat</h2>
          </div>
          <MessageList messages={messages} currentUser={selectedUser} />
          <MessageInput onSend={handleSendMessage} />
        </div>
      </div>
  );
};

export default Chat;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f0f2f5',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '15px 20px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#007bff',
    color: '#ffffff',
  },
};
