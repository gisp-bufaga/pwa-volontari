import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import useSegretariaStore from '../../stores/segretariaStore';
import { useAuthStore } from '../../stores/authStore';

const TodoForm = ({ open, onClose, todo = null }) => {
  const { user } = useAuthStore();
  const { loading, error, createTodo, updateTodo } = useSegretariaStore();

  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    status: 'todo',
    priorita: 'medium',
    assegnato_a: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (todo) {
      setFormData({
        titolo: todo.titolo || '',
        descrizione: todo.descrizione || '',
        status: todo.status || 'todo',
        priorita: todo.priorita || 'medium',
        assegnato_a: todo.assegnato_a || '',
      });
    } else {
      // Reset form
      setFormData({
        titolo: '',
        descrizione: '',
        status: 'todo',
        priorita: 'medium',
        assegnato_a: '',
      });
    }
    setValidationErrors({});
  }, [todo, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.titolo.trim()) {
      errors.titolo = 'Il titolo è obbligatorio';
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
        assegnato_a: formData.assegnato_a || null,
      };

      if (todo) {
        await updateTodo(todo.id, dataToSend);
      } else {
        await createTodo(dataToSend);
      }
      onClose();
    } catch (err) {
      console.error('Errore salvataggio:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{todo ? 'Modifica To-Do' : 'Nuovo To-Do'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Titolo */}
          <TextField
            fullWidth
            label="Titolo *"
            value={formData.titolo}
            onChange={handleChange('titolo')}
            error={!!validationErrors.titolo}
            helperText={validationErrors.titolo}
            sx={{ mb: 2 }}
            autoFocus
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

          {/* Status */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Stato</InputLabel>
            <Select
              value={formData.status}
              label="Stato"
              onChange={handleChange('status')}
            >
              <MenuItem value="todo">Da Fare</MenuItem>
              <MenuItem value="in_progress">In Corso</MenuItem>
              <MenuItem value="done">Completato</MenuItem>
            </Select>
          </FormControl>

          {/* Priorità */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priorità</InputLabel>
            <Select
              value={formData.priorita}
              label="Priorità"
              onChange={handleChange('priorita')}
            >
              <MenuItem value="low">Bassa</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </Select>
          </FormControl>

          {/* Assegnato a - TODO: implementare lista utenti */}
          <TextField
            fullWidth
            label="Assegnato a (ID utente)"
            value={formData.assegnato_a}
            onChange={handleChange('assegnato_a')}
            type="number"
            helperText="Lascia vuoto se non assegnato"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<Cancel />}>
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
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TodoForm;