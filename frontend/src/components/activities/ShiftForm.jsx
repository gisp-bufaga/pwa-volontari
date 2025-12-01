import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';

const ShiftForm = ({ shiftId = null }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedActivityId = searchParams.get('activity');

  const {
    activities,
    selectedShift,
    loading,
    error,
    fetchActivities,
    fetchShift,
    createShift,
    updateShift,
  } = useActivitiesStore();

  const [formData, setFormData] = useState({
    attivita: preSelectedActivityId || '',
    titolo: '',
    data: '',
    ora_inizio: '',
    ora_fine: '',
    posti_disponibili: 0,
    link_iscrizione: '',
    note: '',
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchActivities({ is_active: true });
    if (shiftId) {
      fetchShift(shiftId);
    }
  }, [shiftId, fetchActivities, fetchShift]);

  useEffect(() => {
    if (selectedShift && shiftId) {
      setFormData({
        attivita: selectedShift.attivita || '',
        titolo: selectedShift.titolo || '',
        data: selectedShift.data || '',
        ora_inizio: selectedShift.ora_inizio?.slice(0, 5) || '',
        ora_fine: selectedShift.ora_fine?.slice(0, 5) || '',
        posti_disponibili: selectedShift.posti_disponibili || 0,
        link_iscrizione: selectedShift.link_iscrizione || '',
        note: selectedShift.note || '',
        is_active: selectedShift.is_active ?? true,
      });
    }
  }, [selectedShift, shiftId]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Rimuovi errore di validazione per questo campo
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.attivita) {
      errors.attivita = "L'attività è obbligatoria";
    }

    if (!formData.titolo.trim()) {
      errors.titolo = 'Il titolo è obbligatorio';
    }

    if (!formData.data) {
      errors.data = 'La data è obbligatoria';
    } else {
      const selectedDate = new Date(formData.data);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.data = 'La data non può essere nel passato';
      }
    }

    if (!formData.ora_inizio) {
      errors.ora_inizio = "L'ora di inizio è obbligatoria";
    }

    if (!formData.ora_fine) {
      errors.ora_fine = "L'ora di fine è obbligatoria";
    }

    if (formData.ora_inizio && formData.ora_fine) {
      if (formData.ora_fine <= formData.ora_inizio) {
        errors.ora_fine = "L'ora di fine deve essere dopo l'ora di inizio";
      }
    }

    if (formData.posti_disponibili < 0) {
      errors.posti_disponibili = 'Il numero di posti non può essere negativo';
    }

    if (formData.link_iscrizione && !formData.link_iscrizione.match(/^https?:\/\//)) {
      errors.link_iscrizione = 'Il link deve iniziare con http:// o https://';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        attivita: parseInt(formData.attivita),
        posti_disponibili: parseInt(formData.posti_disponibili),
      };

      if (shiftId) {
        await updateShift(shiftId, dataToSend);
      } else {
        await createShift(dataToSend);
      }
      navigate('/activities/calendar');
    } catch (err) {
      console.error('Errore salvataggio:', err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading && shiftId && !selectedShift) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {shiftId ? 'Modifica Turno' : 'Nuovo Turno'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Attività */}
        <FormControl
          fullWidth
          sx={{ mb: 2 }}
          error={!!validationErrors.attivita}
        >
          <InputLabel>Attività *</InputLabel>
          <Select
            value={formData.attivita}
            label="Attività *"
            onChange={handleChange('attivita')}
          >
            {activities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.nome} ({activity.area_display})
              </MenuItem>
            ))}
          </Select>
          {validationErrors.attivita && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
              {validationErrors.attivita}
            </Typography>
          )}
        </FormControl>

        {/* Titolo */}
        <TextField
          fullWidth
          label="Titolo Turno *"
          value={formData.titolo}
          onChange={handleChange('titolo')}
          error={!!validationErrors.titolo}
          helperText={validationErrors.titolo}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Data */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Data *"
              value={formData.data}
              onChange={handleChange('data')}
              error={!!validationErrors.data}
              helperText={validationErrors.data}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Ora Inizio */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="time"
              label="Ora Inizio *"
              value={formData.ora_inizio}
              onChange={handleChange('ora_inizio')}
              error={!!validationErrors.ora_inizio}
              helperText={validationErrors.ora_inizio}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Ora Fine */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="time"
              label="Ora Fine *"
              value={formData.ora_fine}
              onChange={handleChange('ora_fine')}
              error={!!validationErrors.ora_fine}
              helperText={validationErrors.ora_fine}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Posti Disponibili */}
        <TextField
          fullWidth
          type="number"
          label="Posti Disponibili"
          value={formData.posti_disponibili}
          onChange={handleChange('posti_disponibili')}
          error={!!validationErrors.posti_disponibili}
          helperText={
            validationErrors.posti_disponibili ||
            '0 = illimitato'
          }
          inputProps={{ min: 0 }}
          sx={{ mb: 2 }}
        />

        {/* Link Iscrizione */}
        <TextField
          fullWidth
          label="Link Iscrizione (opzionale)"
          value={formData.link_iscrizione}
          onChange={handleChange('link_iscrizione')}
          error={!!validationErrors.link_iscrizione}
          helperText={
            validationErrors.link_iscrizione ||
            "Link specifico per questo turno (sovrascrive quello dell'attività)"
          }
          placeholder="https://forms.google.com/..."
          sx={{ mb: 2 }}
        />

        {/* Note */}
        <TextField
          fullWidth
          label="Note"
          value={formData.note}
          onChange={handleChange('note')}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {/* Attivo */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_active}
              onChange={handleChange('is_active')}
            />
          }
          label="Turno attivo"
          sx={{ mb: 3 }}
        />

        {/* Bottoni */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ShiftForm;