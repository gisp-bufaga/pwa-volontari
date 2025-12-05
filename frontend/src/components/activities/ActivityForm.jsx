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
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

const ActivityForm = ({ activityId = null }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workAreas, setWorkAreas] = useState([]);
  const {
    selectedActivity,
    loading,
    error,
    fetchActivity,
    createActivity,
    updateActivity,
  } = useActivitiesStore();


  const [formData, setFormData] = useState({
    nome: '',
    descrizione: '',
    work_area: '',
    colore_hex: '#1976d2',
    link_iscrizione: '',
    is_active: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (activityId) {
      fetchActivity(activityId);
    }
  }, [activityId, fetchActivity]);

  useEffect(() => {
    if (selectedActivity && activityId) {
      setFormData({
        nome: selectedActivity.nome || '',
        descrizione: selectedActivity.descrizione || '',
        work_area: selectedActivity.area || '',
        colore_hex: selectedActivity.colore_hex || '#1976d2',
        link_iscrizione: selectedActivity.link_iscrizione || '',
        is_active: selectedActivity.is_active ?? true,
      });
    }
  }, [selectedActivity, activityId]);

    useEffect(() => {
      const fetchWorkAreas = async () => {
        try {
          const response = await api.get('/auth/work-areas/');
          console.log('Work areas response:', response.data); // ✅ Debug
          
          // Se response.data è un array, usalo direttamente
          // Altrimenti potrebbe essere response.data.results o simile
          const areas = Array.isArray(response.data) 
            ? response.data 
            : response.data.results || [];
            
          setWorkAreas(areas);
        } catch (err) {
          console.error('Errore caricamento aree:', err);
          setWorkAreas([]); // ✅ Fallback a array vuoto in caso di errore
        }
      };
      fetchWorkAreas();
    }, []);

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

    if (!formData.nome.trim()) {
      errors.nome = 'Il nome è obbligatorio';
    }

    if (!formData.work_area) {
      errors.work_area = "L'area è obbligatoria";
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
      if (activityId) {
        await updateActivity(activityId, formData);
      } else {
        await createActivity(formData);
      }
      navigate('/activities');
    } catch (err) {
      console.error('Errore salvataggio:', err);
    }
  };

  const handleCancel = () => {
    navigate('/activities');
  };

  // Opzioni aree (dalle WorkArea dell'utente o tutte per superadmin)
  const areaOptions = user?.work_areas || [];

  if (loading && activityId && !selectedActivity) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {activityId ? 'Modifica Attività' : 'Nuova Attività'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Nome */}
        <TextField
          fullWidth
          label="Nome Attività *"
          value={formData.nome}
          onChange={handleChange('nome')}
          error={!!validationErrors.nome}
          helperText={validationErrors.nome}
          sx={{ mb: 2 }}
        />

        {/* Descrizione */}
        <TextField
          fullWidth
          label="Descrizione"
          value={formData.descrizione}
          onChange={handleChange('descrizione')}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        {/* Area */}
        <FormControl
          fullWidth
          sx={{ mb: 2 }}
          error={!!validationErrors.area}
        >
          <InputLabel>Area *</InputLabel>
          <Select
            value={formData.area}
            label="Area *"
            onChange={handleChange('work_area')}
          >
            {workAreas.map((area) => (
              <MenuItem key={area.id} value={area.id}>
                {area.name}
              </MenuItem>
            ))}
          </Select>
          {validationErrors.area && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
              {validationErrors.area}
            </Typography>
          )}
        </FormControl>

        {/* Colore */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Colore
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <input
              type="color"
              value={formData.colore_hex}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, colore_hex: e.target.value }))
              }
              style={{
                width: 60,
                height: 40,
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            />
            <TextField
              label="Codice HEX"
              value={formData.colore_hex}
              onChange={handleChange('colore_hex')}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </Box>

        {/* Link Iscrizione */}
        <TextField
          fullWidth
          label="Link Iscrizione (opzionale)"
          value={formData.link_iscrizione}
          onChange={handleChange('link_iscrizione')}
          error={!!validationErrors.link_iscrizione}
          helperText={
            validationErrors.link_iscrizione ||
            'Link esterno per iscrizioni (es. Google Form)'
          }
          placeholder="https://forms.google.com/..."
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
          label="Attività attiva"
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

export default ActivityForm;