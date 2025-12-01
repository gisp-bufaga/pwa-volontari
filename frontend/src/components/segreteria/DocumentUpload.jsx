import React, { useState } from 'react';
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
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import { Save, Cancel, CloudUpload } from '@mui/icons-material';
import useSegretariaStore from '../../stores/segretariaStore';

const DocumentUpload = ({ open, onClose, document = null }) => {
  const { loading, error, createDocument, updateDocument } = useSegretariaStore();

  const [formData, setFormData] = useState({
    titolo: document?.titolo || '',
    descrizione: document?.descrizione || '',
    categoria: document?.categoria || 'altro',
    visibile_a: document?.visibile_a || 'tutti',
  });

  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validazione dimensione (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          file: 'Il file non può superare i 10MB',
        }));
        return;
      }

      setFile(selectedFile);
      setValidationErrors((prev) => ({
        ...prev,
        file: null,
      }));

      // Auto-compila titolo se vuoto
      if (!formData.titolo) {
        setFormData((prev) => ({
          ...prev,
          titolo: selectedFile.name.replace(/\.[^/.]+$/, ''),
        }));
      }
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.titolo.trim()) {
      errors.titolo = 'Il titolo è obbligatorio';
    }

    if (!document && !file) {
      errors.file = 'Seleziona un file da caricare';
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
      const formDataToSend = new FormData();
      formDataToSend.append('titolo', formData.titolo);
      formDataToSend.append('descrizione', formData.descrizione);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('visibile_a', formData.visibile_a);

      if (file) {
        formDataToSend.append('file', file);
      }

      if (document) {
        await updateDocument(document.id, formDataToSend);
      } else {
        await createDocument(formDataToSend);
      }

      onClose();
    } catch (err) {
      console.error('Errore salvataggio:', err);
    }
  };

  const handleDialogClose = () => {
    setFormData({
      titolo: '',
      descrizione: '',
      categoria: 'altro',
      visibile_a: 'tutti',
    });
    setFile(null);
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {document ? 'Modifica Documento' : 'Carica Nuovo Documento'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Upload File */}
          {!document && (
            <Box sx={{ mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2 }}
              >
                {file ? file.name : 'Seleziona File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
              </Button>
              {validationErrors.file && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {validationErrors.file}
                </Typography>
              )}
              {file && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Dimensione: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Box>
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
            autoFocus={!!document}
          />

          {/* Descrizione */}
          <TextField
            fullWidth
            label="Descrizione"
            value={formData.descrizione}
            onChange={handleChange('descrizione')}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          {/* Categoria */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.categoria}
              label="Categoria"
              onChange={handleChange('categoria')}
            >
              <MenuItem value="organigramma">Organigramma</MenuItem>
              <MenuItem value="guida">Guida/Manuale</MenuItem>
              <MenuItem value="modulo">Modulo/Template</MenuItem>
              <MenuItem value="regolamento">Regolamento</MenuItem>
              <MenuItem value="verbale">Verbale</MenuItem>
              <MenuItem value="altro">Altro</MenuItem>
            </Select>
          </FormControl>

          {/* Visibilità */}
          <FormControl fullWidth>
            <InputLabel>Visibile a</InputLabel>
            <Select
              value={formData.visibile_a}
              label="Visibile a"
              onChange={handleChange('visibile_a')}
            >
              <MenuItem value="tutti">Tutti i volontari</MenuItem>
              <MenuItem value="admin">Solo admin</MenuItem>
              <MenuItem value="segreteria">Solo segreteria</MenuItem>
            </Select>
          </FormControl>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} startIcon={<Cancel />}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'Caricamento...' : document ? 'Salva' : 'Carica'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentUpload;