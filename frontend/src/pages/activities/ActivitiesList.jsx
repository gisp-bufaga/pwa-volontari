import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useActivitiesStore from '../../stores/activitiesStore';
import { useAuthStore } from '../../stores/authStore';
import ActivityCard from '../../components/activities/ActivityCard';

const ActivitiesList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activitiesByArea,
    loading,
    error,
    fetchActivitiesByArea,
  } = useActivitiesStore();

  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivitiesByArea();
  }, [fetchActivitiesByArea]);

  const handleTabChange = (event, newValue) => {
    setSelectedArea(newValue);
  };

  const handleCreateActivity = () => {
    navigate('/activities/create');
  };

  // Filtra attività per area e ricerca
  const getFilteredActivities = () => {
    let activities = [];

    if (selectedArea === 'all') {
      // Tutte le aree
      Object.values(activitiesByArea).forEach((areaActivities) => {
        activities = [...activities, ...areaActivities];
      });
    } else {
      // Area specifica
      activities = activitiesByArea[selectedArea] || [];
    }

    // Filtro ricerca
    if (searchQuery) {
      activities = activities.filter(
        (activity) =>
          activity.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.descrizione.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return activities;
  };

  const filteredActivities = getFilteredActivities();

  // Tabs per aree
  const areaTabs = [
    { value: 'all', label: 'Tutte le Aree' },
    ...Object.keys(activitiesByArea).map((areaCode) => ({
      value: areaCode,
      label:
        activitiesByArea[areaCode][0]?.area_display || areaCode.toUpperCase(),
    })),
  ];

  if (loading && Object.keys(activitiesByArea).length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
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
          Attività
        </Typography>

        {/* Bottone crea (solo per admin) */}
        {user && ['superadmin', 'admin'].includes(user.role) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateActivity}
          >
            Nuova Attività
          </Button>
        )}
      </Box>

      {/* Barra di ricerca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Cerca attività..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs per aree */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedArea}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {areaTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {/* Errore */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Grid di card */}
      {filteredActivities.length > 0 ? (
        <Grid container spacing={3}>
          {filteredActivities.map((activity) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
              <ActivityCard activity={activity} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6">
            {searchQuery
              ? 'Nessuna attività trovata'
              : 'Nessuna attività disponibile'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {searchQuery
              ? 'Prova a modificare i criteri di ricerca'
              : 'Le attività verranno visualizzate qui quando disponibili'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ActivitiesList;