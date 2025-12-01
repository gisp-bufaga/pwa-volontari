import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  Person,
  Warning,
} from '@mui/icons-material';
import { useState } from 'react';

const TodoCard = ({ todo, onEdit, onDelete, onMarkDone, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(todo);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (window.confirm('Sei sicuro di voler eliminare questo to-do?')) {
      onDelete(todo.id);
    }
  };

  const handleMarkDone = () => {
    handleMenuClose();
    onMarkDone(todo.id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return '#ff9800';
      case 'in_progress':
        return '#2196f3';
      case 'done':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        borderLeft: 4,
        borderColor: getPriorityColor(todo.priorita),
      }}
    >
      <CardContent>
        {/* Header con priorità e menu */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Chip
            label={todo.priorita_display}
            size="small"
            sx={{
              bgcolor: `${getPriorityColor(todo.priorita)}20`,
              color: getPriorityColor(todo.priorita),
              fontWeight: 600,
            }}
          />
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Titolo */}
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          sx={{
            textDecoration: todo.status === 'done' ? 'line-through' : 'none',
            color: todo.status === 'done' ? 'text.secondary' : 'text.primary',
          }}
        >
          {todo.titolo}
        </Typography>

        {/* Descrizione */}
        {todo.descrizione && (
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
            {todo.descrizione}
          </Typography>
        )}

        {/* Assegnato a */}
        {todo.assegnato_a_name && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
              {todo.assegnato_a_name.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {todo.assegnato_a_name}
            </Typography>
          </Box>
        )}

        {/* Warning se in ritardo */}
        {todo.is_overdue && todo.status !== 'done' && (
          <Chip
            icon={<Warning />}
            label="In ritardo"
            size="small"
            color="error"
            sx={{ mt: 1 }}
          />
        )}

        {/* Data completamento */}
        {todo.completed_at && (
          <Typography variant="caption" color="text.secondary" display="block">
            Completato il:{' '}
            {new Date(todo.completed_at).toLocaleDateString('it-IT')}
          </Typography>
        )}
      </CardContent>

      {/* Menu azioni */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {todo.status !== 'done' && (
          <MenuItem onClick={handleMarkDone}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Marca come completato
          </MenuItem>
        )}
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

export default TodoCard;