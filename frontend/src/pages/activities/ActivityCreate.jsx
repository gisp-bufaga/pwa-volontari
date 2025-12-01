import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ActivityForm from '../../components/activities/ActivityForm';

const ActivityCreate = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/activities')}
        sx={{ mb: 2 }}
      >
        Torna alle attività
      </Button>
      <ActivityForm />
    </Container>
  );
};

export default ActivityCreate;