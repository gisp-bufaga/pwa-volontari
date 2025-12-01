import React from 'react';
import { Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShiftForm from '../../components/activities/ShiftForm';

const ShiftCreate = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/activities/calendar')}
        sx={{ mb: 2 }}
      >
        Torna al calendario
      </Button>
      <ShiftForm />
    </Container>
  );
};

export default ShiftCreate;