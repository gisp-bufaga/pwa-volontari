import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Errore durante l\'aggiornamento');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      superadmin: { label: 'Super Admin', color: 'error' },
      admin: { label: 'Amministratore', color: 'primary' },
      base: { label: 'Volontario', color: 'success' },
    };
    return badges[role] || { label: role, color: 'default' };
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Il Mio Profilo
      </Typography>

      <Grid container spacing={3}>
        {/* Informazioni Account */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {user?.first_name?.[0] || user?.username?.[0] || <Person />}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user?.username}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={roleBadge.label} 
                  color={roleBadge.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {user?.work_areas && user.work_areas.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Aree di Lavoro
                  </Typography>
                  {user.work_areas.map((area) => (
                    <Chip
                      key={area.id}
                      label={area.name}
                      size="small"
                      sx={{ m: 0.5 }}
                      style={{ backgroundColor: area.color, color: '#fff' }}
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Membro dal {new Date(user?.date_joined).toLocaleDateString('it-IT')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Form Modifica Profilo */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Modifica Informazioni
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profilo aggiornato con successo!
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="first_name"
                      label="Nome"
                      value={formData.first_name}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="last_name"
                      label="Cognome"
                      value={formData.last_name}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="phone"
                      label="Telefono"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                    >
                      {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}