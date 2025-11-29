import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';
import userService from '../services/userService';

export default function EditUserDialog({ open, onClose, onSuccess, user }) {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'base',
    phone: '',
    is_active_volunteer: true,
    joined_date: '',
    work_area_ids: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [workAreas, setWorkAreas] = useState([]);

  // Load work areas and populate form when dialog opens
  useEffect(() => {
    if (open && user) {
      loadWorkAreas();
      populateForm();
    }
  }, [open, user]);

  const loadWorkAreas = async () => {
    try {
      const data = await userService.getWorkAreas();
      setWorkAreas(data.results || data || []);
    } catch (err) {
      console.error('Error loading work areas:', err);
    }
  };

  const populateForm = () => {
    if (!user) return;
    
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role || 'base',
      phone: user.phone || '',
      is_active_volunteer: user.is_active_volunteer ?? true,
      joined_date: user.joined_date || '',
      work_area_ids: user.work_areas?.map(wa => wa.id) || [],
    });
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username è obbligatorio';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email non valida';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'Nome è obbligatorio';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Cognome è obbligatorio';
    }

    return errors;
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user (password fields are not included, so won't be changed)
      await userService.updateUser(user.id, formData);

      // Success!
      onSuccess();
      handleClose();
      
      alert('Utente aggiornato con successo!');
    } catch (err) {
      console.error('Error updating user:', err);
      
      if (err.response?.data) {
        // Handle field-specific errors from backend
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          setFieldErrors(backendErrors);
        } else {
          setError(backendErrors.detail || 'Errore nell\'aggiornamento dell\'utente');
        }
      } else {
        setError('Errore nell\'aggiornamento dell\'utente. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    // Reset form
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'base',
      phone: '',
      is_active_volunteer: true,
      joined_date: '',
      work_area_ids: [],
    });
    setFieldErrors({});
    setError(null);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Modifica Utente</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Error Alert */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            {/* Username */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={!!fieldErrors.username}
                helperText={fieldErrors.username}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                error={!!fieldErrors.first_name}
                helperText={fieldErrors.first_name}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cognome"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                error={!!fieldErrors.last_name}
                helperText={fieldErrors.last_name}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ruolo</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  label="Ruolo"
                  disabled={loading}
                >
                  <MenuItem value="base">Volontario Base</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superadmin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefono"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                fullWidth
                disabled={loading}
              />
            </Grid>

            {/* Work Areas */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Aree di Lavoro</InputLabel>
                <Select
                  multiple
                  value={formData.work_area_ids}
                  onChange={(e) => handleChange('work_area_ids', e.target.value)}
                  input={<OutlinedInput label="Aree di Lavoro" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => {
                        const area = workAreas.find((wa) => wa.id === id);
                        return (
                          <Chip
                            key={id}
                            label={area?.name || id}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  disabled={loading}
                >
                  {workAreas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Joined Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data Iscrizione"
                type="date"
                value={formData.joined_date}
                onChange={(e) => handleChange('joined_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={loading}
              />
            </Grid>

            {/* Active Volunteer */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active_volunteer}
                    onChange={(e) => handleChange('is_active_volunteer', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Volontario Attivo"
              />
            </Grid>

            {/* Info: Password */}
            <Grid item xs={12}>
              <Alert severity="info">
                Per cambiare la password, usa l'azione "Invia Credenziali" dal menu bulk actions.
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annulla
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}