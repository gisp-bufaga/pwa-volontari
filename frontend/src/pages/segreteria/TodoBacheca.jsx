import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { Add, Assessment } from '@mui/icons-material';
import useSegretariaStore from '../../stores/segretariaStore';
import { useAuthStore } from '../../stores/authStore';
import TodoBoard from '../../components/segreteria/TodoBoard';
import TodoForm from '../../components/segreteria/TodoForm';

const TodoBacheca = () => {
  const { user } = useAuthStore();
  const {
    todosBacheca,
    todosStats,
    loading,
    error,
    fetchTodosBacheca,
    fetchTodosStats,
    updateTodo,
    deleteTodo,
    markTodoDone,
  } = useSegretariaStore();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchTodosBacheca();
    fetchTodosStats();
  };

  const handleCreate = () => {
    setSelectedTodo(null);
    setFormOpen(true);
  };

  const handleEdit = (todo) => {
    setSelectedTodo(todo);
    setFormOpen(true);
  };

  const handleDelete = async (todoId) => {
    try {
      await deleteTodo(todoId);
      loadData();
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  const handleMarkDone = async (todoId) => {
    try {
      await markTodoDone(todoId);
      loadData();
    } catch (err) {
      console.error('Errore:', err);
    }
  };

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      await updateTodo(todoId, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Errore cambio status:', err);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTodo(null);
    loadData();
  };

  const canManage =
    user &&
    (user.role === 'superadmin' ||
      (user.role === 'admin' &&
        user.work_areas?.some((wa) => wa.code === 'segreteria')));

  if (loading && !todosBacheca.todo) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!canManage) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">
          Non hai i permessi per accedere alla bacheca to-do della segreteria.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Bacheca To-Do
        </Typography>

        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Nuovo To-Do
        </Button>
      </Box>

      {/* Statistiche */}
      {todosStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {todosStats.totali}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Totali
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {todosStats.da_fare}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Da Fare
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {todosStats.in_corso}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Corso
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {todosStats.completati}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completati
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bacheca Kanban */}
      <TodoBoard
        todosBacheca={todosBacheca}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkDone={handleMarkDone}
        onStatusChange={handleStatusChange}
      />

      {/* Form Dialog */}
      <TodoForm
        open={formOpen}
        onClose={handleFormClose}
        todo={selectedTodo}
      />
    </Container>
  );
};

export default TodoBacheca;