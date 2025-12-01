import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  CalendarMonth,
  AccessTime,
  People,
  ExitToApp,
  Description,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';
import { useAuthStore } from '../../stores/authStore';

const ShiftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedShift,
    loading,
    error,
    fetchShift,
    deleteShift,
  } = useActivitiesStore();

  useEffect(() => {
    fetchShift(id);
  }, [id, fetchShift]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/activities/shifts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo turno?')) {
      try {
        await deleteShift(id);
        navigate('/activities');
      } catch (err) {
        console.error('Errore eliminazione:', err);
      }
    }
  };

  const canEdit =
    user &&
    (user.role === 'superadmin' ||
      (user.role === 'admin' &&
        (user.work_areas?.some(
          (wa) => wa.code === selectedShift?.attivita_detail?.area
        ) ||
          user.work_areas?.some((wa) => wa.code === 'segreteria'))));

  if (loading && !selectedShift) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!selectedShift) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Turno non trovato</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Indietro
        </Button>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {selectedShift.titolo}
            </Typography>
            {selectedShift.attivita_detail && (
              <Chip
                label={selectedShift.attivita_detail.area_display}
                sx={{
                  bgcolor: `${selectedShift.attivita_detail.colore_hex}20`,
                  color: selectedShift.attivita_detail.colore_hex,
                  fontWeight: 600,
                }}
              />
            )}
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

      {/* Info Attività */}
      {selectedShift.attivita_detail && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Attività
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {selectedShift.attivita_detail.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedShift.attivita_detail.descrizione}
          </Typography>
        </Paper>
      )}

      {/* Dettagli Turno */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dettagli Turno
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Data */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonth color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Data
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date(selectedShift.data).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Orario */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Orario
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedShift.ora_inizio.slice(0, 5)} -{' '}
                  {selectedShift.ora_fine.slice(0, 5)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Posti disponibili */}
          {selectedShift.posti_disponibili > 0 && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Posti disponibili
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedShift.posti_disponibili}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Note */}
        {selectedShift.note && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Description color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Note
                </Typography>
                <Typography variant="body2">{selectedShift.note}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Pulsante Iscrizione */}
      {selectedShift.has_enrollment_link && (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Vuoi partecipare a questo turno?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Clicca sul pulsante per iscriverti
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ExitToApp />}
            href={selectedShift.enrollment_link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Iscriviti al Turno
          </Button>
        </Paper>
      )}

      {/* Info aggiuntive */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Creato da: {selectedShift.created_by_name || 'N/D'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Data creazione:{' '}
          {new Date(selectedShift.created_at).toLocaleDateString('it-IT')}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ShiftDetail;