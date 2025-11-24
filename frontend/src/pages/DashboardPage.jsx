import { Box, Grid, Card, CardContent, Typography, Avatar } from '@mui/material';
import {
  People,
  Assignment,
  LocalShipping,
  Notifications,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Utenti Attivi',
      value: '24',
      icon: People,
      color: '#1976d2',
    },
    {
      title: 'Attività del Mese',
      value: '12',
      icon: Assignment,
      color: '#2e7d32',
    },
    {
      title: 'Forniture',
      value: '156',
      icon: LocalShipping,
      color: '#ed6c02',
    },
    {
      title: 'Notifiche',
      value: '8',
      icon: Notifications,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      {/* Benvenuto */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Benvenuto, {user?.first_name || user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panoramica del sistema - {new Date().toLocaleDateString('it-IT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      {/* Statistiche */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    <stat.icon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Prossime Funzionalità */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Prossime Funzionalità
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1" paragraph>
              📊 <strong>Sprint 2:</strong> Gestione Attività e Segreteria
            </Typography>
            <Typography variant="body1" paragraph>
              📦 <strong>Sprint 3:</strong> Gestione Forniture e Stock
            </Typography>
            <Typography variant="body1" paragraph>
              🚗 <strong>Sprint 4:</strong> Gestione Veicoli e Manutenzione
            </Typography>
            <Typography variant="body1">
              ✅ <strong>Sprint 5:</strong> Sistema Checklist
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}