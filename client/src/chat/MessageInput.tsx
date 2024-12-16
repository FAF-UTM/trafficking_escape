// MessageInput.tsx
import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue.trim());
    setInputValue('');
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={styles.input}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <button onClick={handleSend} style={styles.button}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    padding: '15px 20px',
    borderTop: '1px solid #dee2e6',
    backgroundColor: '#f8f9fa',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '25px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    marginLeft: '15px',
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: '#0d6efd',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
