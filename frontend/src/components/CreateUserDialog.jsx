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

export default function CreateUserDialog({ open, onClose, onSuccess }) {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
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
  const [sendCredentials, setSendCredentials] = useState(false);

  // Load work areas
  useEffect(() => {
    if (open) {
      loadWorkAreas();
    }
  }, [open]);

  const loadWorkAreas = async () => {
    try {
      const data = await userService.getWorkAreas();
      setWorkAreas(data.results || data || []);
    } catch (err) {
      console.error('Error loading work areas:', err);
    }
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

    if (!sendCredentials) {
      if (!formData.password) {
        errors.password = 'Password è obbligatoria';
      } else if (formData.password.length < 8) {
        errors.password = 'Password deve essere almeno 8 caratteri';
      }

      if (formData.password !== formData.password_confirm) {
        errors.password_confirm = 'Le password non corrispondono';
      }
    }

    return errors;
  };

  // Generate random password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: password,
      password_confirm: password,
    }));
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
      // If sendCredentials is true, generate a temporary password
      let submitData = { ...formData };
      
      if (sendCredentials) {
        // Generate a random password for backend
        const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
        submitData.password = tempPassword;
        submitData.password_confirm = tempPassword;
      }

      // Create user
      const newUser = await userService.createUser(submitData);

      // If sendCredentials, trigger password reset/send credentials
      if (sendCredentials) {
        try {
          await userService.bulkActions('send_credentials', [newUser.id]);
        } catch (emailErr) {
          console.warn('User created but email failed:', emailErr);
          // Don't fail the whole operation if email fails
        }
      }

      // Success!
      onSuccess(newUser);
      handleClose();
      
      const message = sendCredentials 
        ? 'Utente creato con successo! Le credenziali sono state inviate via email.'
        : 'Utente creato con successo!';
      alert(message);
    } catch (err) {
      console.error('Error creating user:', err);
      
      if (err.response?.data) {
        // Handle field-specific errors from backend
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          setFieldErrors(backendErrors);
        } else {
          setError(backendErrors.detail || 'Errore nella creazione dell\'utente');
        }
      } else {
        setError('Errore nella creazione dell\'utente. Riprova.');
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
      password: '',
      password_confirm: '',
      role: 'base',
      phone: '',
      is_active_volunteer: true,
      joined_date: '',
      work_area_ids: [],
    });
    setFieldErrors({});
    setError(null);
    setSendCredentials(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Crea Nuovo Utente</DialogTitle>
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

            {/* Send Credentials Checkbox */}
            <Grid item xs={12}>
              <Alert severity="info">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendCredentials}
                      onChange={(e) => setSendCredentials(e.target.checked)}
                    />
                  }
                  label="Genera password automatica e invia credenziali via email"
                />
              </Alert>
            </Grid>

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

            {/* Password fields - only if not sending credentials */}
            {!sendCredentials && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password || 'Minimo 8 caratteri'}
                    fullWidth
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Conferma Password"
                    type="password"
                    value={formData.password_confirm}
                    onChange={(e) => handleChange('password_confirm', e.target.value)}
                    error={!!fieldErrors.password_confirm}
                    helperText={fieldErrors.password_confirm}
                    fullWidth
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={generatePassword}
                    disabled={loading}
                  >
                    Genera Password Casuale
                  </Button>
                </Grid>
              </>
            )}

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
          {loading ? 'Creazione...' : 'Crea Utente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}