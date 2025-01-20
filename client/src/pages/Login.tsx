import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme'; // Import the updated theme
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './pages.module.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/chat');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container className={styles.login} component="main" maxWidth="xs">
        <CssBaseline />

        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Traffiking Escape
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
            noValidate
            autoComplete="off"
          >
            <TextField
              margin="normal"
              required
              fullWidth
              variant="outlined"
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
      <div className={styles.login_image}></div>
    </ThemeProvider>
  );
};

export default LoginPage;
