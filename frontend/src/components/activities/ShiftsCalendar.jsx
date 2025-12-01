import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';

const ShiftsCalendar = ({ selectedArea = null }) => {
  const navigate = useNavigate();
  const { calendarShifts, loading, error, fetchCalendarShifts } =
    useActivitiesStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, selectedArea]);

  const loadCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const params = {
      mese: `${year}-${month.toString().padStart(2, '0')}`,
    };

    if (selectedArea) {
      params.area = selectedArea;
    }

    fetchCalendarShifts(params);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleShiftClick = (shiftId) => {
    navigate(`/activities/shifts/${shiftId}`);
  };

  // Genera giorni del mese
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Giorni vuoti prima del primo giorno del mese
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Ottieni turni per un giorno specifico
  const getShiftsForDay = (date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    return calendarShifts.filter((shift) => shift.data === dateStr);
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });

  if (loading && calendarShifts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header calendario */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ minWidth: 200, textAlign: 'center' }}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Button variant="outlined" onClick={handleToday}>
          Oggi
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Giorni della settimana */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 1,
        }}
      >
        {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'text.secondary',
              py: 1,
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Grid calendario */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          minHeight: 400,
        }}
      >
        {calendarDays.map((date, index) => {
          const shifts = date ? getShiftsForDay(date) : [];
          const isToday =
            date && date.toDateString() === new Date().toDateString();
          const isPast = date && date < new Date().setHours(0, 0, 0, 0);

          return (
            <Paper
              key={index}
              variant="outlined"
              sx={{
                p: 1,
                minHeight: 100,
                bgcolor: date ? (isToday ? 'primary.light' : 'background.paper') : 'grey.50',
                opacity: isPast && !isToday ? 0.6 : 1,
                position: 'relative',
              }}
            >
              {date && (
                <>
                  {/* Numero del giorno */}
                  <Typography
                    variant="body2"
                    fontWeight={isToday ? 'bold' : 'normal'}
                    color={isToday ? 'primary.contrastText' : 'text.primary'}
                    sx={{ mb: 0.5 }}
                  >
                    {date.getDate()}
                  </Typography>

                  {/* Turni del giorno */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {shifts.slice(0, 3).map((shift) => (
                      <Chip
                        key={shift.id}
                        label={shift.titolo}
                        size="small"
                        onClick={() => handleShiftClick(shift.id)}
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          cursor: 'pointer',
                          bgcolor: `${shift.attivita_colore}30`,
                          color: shift.attivita_colore,
                          '&:hover': {
                            bgcolor: `${shift.attivita_colore}50`,
                          },
                          '& .MuiChip-label': {
                            px: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    ))}
                    {shifts.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{shifts.length - 3} altri
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Legenda */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              bgcolor: 'primary.light',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption">Oggi</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarMonth fontSize="small" color="action" />
          <Typography variant="caption">
            {calendarShifts.length} turni questo mese
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ShiftsCalendar;