import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  CalendarMonth,
  AccessTime,
  People,
  ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';
import { useAuthStore } from '../../stores/authStore';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedActivity,
    loading,
    error,
    fetchActivity,
    deleteActivity,
  } = useActivitiesStore();

  useEffect(() => {
    fetchActivity(id);
  }, [id, fetchActivity]);

  const handleBack = () => {
    navigate('/activities');
  };

  const handleEdit = () => {
    navigate(`/activities/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      try {
        await deleteActivity(id);
        navigate('/activities');
      } catch (err) {
        console.error('Errore eliminazione:', err);
      }
    }
  };

  const handleShiftClick = (shiftId) => {
    navigate(`/activities/shifts/${shiftId}`);
  };

  const canEdit =
    user &&
    (user.role === 'superadmin' ||
      (user.role === 'admin' &&
        (user.work_areas?.some((wa) => wa.code === selectedActivity?.area) ||
          user.work_areas?.some((wa) => wa.code === 'segreteria'))));

  if (loading && !selectedActivity) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!selectedActivity) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Attività non trovata</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Torna alle attività
        </Button>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {selectedActivity.nome}
            </Typography>
            <Chip
              label={selectedActivity.area_display}
              sx={{
                bgcolor: `${selectedActivity.colore_hex}20`,
                color: selectedActivity.colore_hex,
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Azioni admin */}
          {canEdit && (
            <Box>
              <IconButton color="primary" onClick={handleEdit}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={handleDelete}>
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dettagli Attività */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Descrizione
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {selectedActivity.descrizione || 'Nessuna descrizione disponibile'}
        </Typography>

        {selectedActivity.link_iscrizione && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<ExitToApp />}
              href={selectedActivity.link_iscrizione}
              target="_blank"
              rel="noopener noreferrer"
            >
              Link Iscrizione Generale
            </Button>
          </Box>
        )}
      </Paper>

      {/* Prossimi Turni */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Prossimi Turni
          </Typography>
          {canEdit && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/activities/shifts/create?activity=${id}`)}
            >
              Aggiungi Turno
            </Button>
          )}
        </Box>

        {selectedActivity.prossimi_turni &&
        selectedActivity.prossimi_turni.length > 0 ? (
          <Grid container spacing={2}>
            {selectedActivity.prossimi_turni.map((shift) => (
              <Grid item xs={12} md={6} key={shift.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleShiftClick(shift.id)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {shift.titolo}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(shift.data).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {shift.ora_inizio.slice(0, 5)} -{' '}
                          {shift.ora_fine.slice(0, 5)}
                        </Typography>
                      </Box>
                    </Box>

                    {shift.posti_disponibili > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {shift.posti_disponibili} posti
                        </Typography>
                      </Box>
                    )}

                    {shift.has_enrollment_link && (
                      <Chip
                        label="Iscrizione disponibile"
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nessun turno programmato al momento
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Info aggiuntive */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Creato da: {selectedActivity.created_by_name || 'N/D'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data creazione:{' '}
          {new Date(selectedActivity.created_at).toLocaleDateString('it-IT')}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ActivityDetail;