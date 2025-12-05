import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import {
  CalendarMonth,
  Group,
  ChevronRight,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ activity }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/activities/${activity.id}`);
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
        borderLeft: 4,
        borderColor: activity.colore_hex || '#1976d2',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con Avatar colorato */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: activity.colore_hex || '#1976d2',
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {activity.nome.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" gutterBottom>
              {activity.nome}
            </Typography>
            <Chip
              label={activity.work_area_name} 
              size="small"
              sx={{
                bgcolor: `${activity.work_area_color}20`,
                color: activity.work_area_color,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Descrizione */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {activity.descrizione || 'Nessuna descrizione disponibile'}
        </Typography>

        {/* Info prossimi turni */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          <CalendarMonth color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {activity.prossimi_turni_count > 0
              ? `${activity.prossimi_turni_count} ${
                  activity.prossimi_turni_count === 1
                    ? 'turno disponibile'
                    : 'turni disponibili'
                }`
              : 'Nessun turno programmato'}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ChevronRight />}
          onClick={handleViewDetails}
          sx={{
            borderColor: activity.colore_hex,
            color: activity.colore_hex,
            '&:hover': {
              borderColor: activity.colore_hex,
              bgcolor: `${activity.colore_hex}10`,
            },
          }}
        >
          Vedi Dettagli
        </Button>
      </CardActions>
    </Card>
  );
};

export default ActivityCard;