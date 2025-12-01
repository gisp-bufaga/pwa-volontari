import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Add, CalendarMonth, ViewList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import useActivitiesStore from '../../stores/activitiesStore';
import ShiftsCalendar from '../../components/activities/ShiftsCalendar';

const ShiftsCalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activitiesByArea, fetchActivitiesByArea } = useActivitiesStore();

  const [selectedArea, setSelectedArea] = useState('all');
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list

  useEffect(() => {
    fetchActivitiesByArea();
  }, [fetchActivitiesByArea]);

  const handleCreateShift = () => {
    navigate('/activities/shifts/create');
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === 'list') {
        navigate('/activities/shifts');
      }
    }
  };

  const canCreate = user && ['superadmin', 'admin'].includes(user.role);

  // Opzioni aree per filtro
  const areaOptions = [
    { value: 'all', label: 'Tutte le Aree' },
    ...Object.keys(activitiesByArea).map((areaCode) => ({
      value: areaCode,
      label:
        activitiesByArea[areaCode][0]?.area_display || areaCode.toUpperCase(),
    })),
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Calendario Turni
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Toggle vista */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="calendar">
              <CalendarMonth sx={{ mr: 0.5 }} />
              Calendario
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList sx={{ mr: 0.5 }} />
              Lista
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Bottone crea (solo per admin) */}
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateShift}
            >
              Nuovo Turno
            </Button>
          )}
        </Box>
      </Box>

      {/* Filtro area */}
      <Box sx={{ mb: 3, maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel>Filtra per Area</InputLabel>
          <Select
            value={selectedArea}
            label="Filtra per Area"
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {areaOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendario */}
      <ShiftsCalendar
        selectedArea={selectedArea === 'all' ? null : selectedArea}
      />
    </Container>
  );
};

export default ShiftsCalendarPage;