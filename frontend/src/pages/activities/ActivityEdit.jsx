import React from 'react';
import { Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ActivityForm from '../../components/activities/ActivityForm';

const ActivityEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/activities/${id}`)}
        sx={{ mb: 2 }}
      >
        Indietro
      </Button>
      <ActivityForm activityId={id} />
    </Container>
  );
};

export default ActivityEdit;