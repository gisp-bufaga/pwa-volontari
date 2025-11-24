import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Se già autenticato, redirect alla dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Validazione base
    if (!username || !password) {
      setLocalError('Username e password sono obbligatori');
      return;
    }

    const result = await login({ username, password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setLocalError(result.error || 'Login fallito');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo e Titolo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              PWA Volontari
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accedi al sistema di gestione
            </Typography>
          </Box>

          {/* Form di Login */}
          <form onSubmit={handleSubmit}>
            {/* Errori */}
            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {localError || error}
              </Alert>
            )}

            {/* Username */}
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              sx={{ mb: 2 }}
            />

            {/* Password */}
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Bottone Login */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          {/* Info Aggiuntive */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              PWA Volontari v1.0 - Sistema di Gestione Interna
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}