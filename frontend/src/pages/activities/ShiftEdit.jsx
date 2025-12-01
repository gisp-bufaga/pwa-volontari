import React from 'react';
import { Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ShiftForm from '../../components/activities/ShiftForm';

const ShiftEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/activities/shifts/${id}`)}
        sx={{ mb: 2 }}
      >
        Indietro
      </Button>
      <ShiftForm shiftId={id} />
    </Container>
  );
};

export default ShiftEdit;