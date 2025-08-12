import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import styles from './admin.module.css';

const AdminPage: React.FC = () => {
  const [chatName, setChatName] = useState('');
  const [chatImageUrl, setChatImageUrl] = useState('');
  const [isTrafficker, setIsTrafficker] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/chats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatName,
            chatImageUrl,
            isTrafficker,
          }),
        }
      );

      if (response.ok) {
        setMessage('Session created successfully');
        setChatName('');
        setChatImageUrl('');
        setIsTrafficker(false);
      } else {
        setMessage('Failed to create session');
      }
    } catch (err) {
      setMessage('Failed to create session');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm" className={styles.admin}>
        <Typography component="h1" variant="h5" sx={{ mt: 4 }}>
          Admin Panel
        </Typography>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Chat Name"
            fullWidth
            margin="normal"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="normal"
            value={chatImageUrl}
            onChange={(e) => setChatImageUrl(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isTrafficker}
                onChange={(e) => setIsTrafficker(e.target.checked)}
              />
            }
            label="Is Trafficker"
          />
          {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Session
          </Button>
        </form>
      </Container>
    </ThemeProvider>
  );
};

export default AdminPage;