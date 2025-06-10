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
import theme from '../../theme/theme'; // Import the updated theme
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import { t } from 'i18next';

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
            Trafficking Escape
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
      <Link to={'/'} className={styles.back_home}>
        <svg
          fill="none"
          height="10"
          viewBox="0 0 14 10"
          width="14"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clip-rule="evenodd"
            d="M0.25066 4.99997C0.25066 4.80106 0.329678 4.61029 0.47033 4.46964C0.610983 4.32899 0.801748 4.24997 1.00066 4.24997L11.1907 4.24997L8.47066 1.52997C8.33818 1.38779 8.26606 1.19975 8.26948 1.00545C8.27291 0.811145 8.35162 0.62576 8.48904 0.488347C8.62645 0.350934 8.81184 0.272222 9.00614 0.268794C9.20044 0.265365 9.38849 0.337489 9.53066 0.469969L13.5307 4.46997C13.6711 4.61059 13.75 4.80122 13.75 4.99997C13.75 5.19872 13.6711 5.38934 13.5307 5.52997L9.53066 9.52997C9.38849 9.66245 9.20044 9.73457 9.00614 9.73114C8.81184 9.72772 8.62645 9.649 8.48904 9.51159C8.35162 9.37418 8.27291 9.18879 8.26948 8.99449C8.26606 8.80019 8.33818 8.61214 8.47066 8.46997L11.1907 5.74997L1.00066 5.74997C0.801748 5.74997 0.610983 5.67095 0.47033 5.5303C0.329678 5.38965 0.25066 5.19888 0.25066 4.99997Z"
            fill="#212A55"
            fill-rule="evenodd"
          ></path>
        </svg>
        {t('general.home')}
      </Link>
    </ThemeProvider>
  );
};

export default LoginPage;
