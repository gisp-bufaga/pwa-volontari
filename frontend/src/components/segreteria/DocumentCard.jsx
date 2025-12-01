import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Download,
  MoreVert,
  Edit,
  Delete,
  Description,
  PictureAsPdf,
  InsertDriveFile,
} from '@mui/icons-material';
import { useState } from 'react';

const DocumentCard = ({ document, onEdit, onDelete, canEdit = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(document);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
      onDelete(document.id);
    }
  };

  const handleDownload = () => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const getFileIcon = (extension) => {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return <PictureAsPdf sx={{ fontSize: 48, color: '#f44336' }} />;
      case '.doc':
      case '.docx':
        return <Description sx={{ fontSize: 48, color: '#2196f3' }} />;
      case '.xls':
      case '.xlsx':
        return <InsertDriveFile sx={{ fontSize: 48, color: '#4caf50' }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: 48, color: '#757575' }} />;
    }
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      organigramma: '#9c27b0',
      guida: '#2196f3',
      modulo: '#ff9800',
      regolamento: '#f44336',
      verbale: '#4caf50',
      altro: '#757575',
    };
    return colors[categoria] || '#757575';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con icona file e menu */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
            {getFileIcon(document.file_extension)}
            <Typography variant="caption" display="block" color="text.secondary">
              {document.file_extension?.toUpperCase()} · {document.file_size_mb}MB
            </Typography>
          </Box>

          {canEdit && (
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Titolo */}
        <Typography variant="h6" component="div" gutterBottom>
          {document.titolo}
        </Typography>

        {/* Descrizione */}
        {document.descrizione && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {document.descrizione}
          </Typography>
        )}

        {/* Chips categoria e visibilità */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={document.categoria_display}
            size="small"
            sx={{
              bgcolor: `${getCategoriaColor(document.categoria)}20`,
              color: getCategoriaColor(document.categoria),
              fontWeight: 600,
            }}
          />
          <Chip
            label={document.visibile_a_display}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Info caricamento */}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Caricato da: {document.uploaded_by_name || 'N/D'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {new Date(document.created_at).toLocaleDateString('it-IT')}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Scarica
        </Button>
      </CardActions>

      {/* Menu azioni */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Modifica
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Elimina
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default DocumentCard;