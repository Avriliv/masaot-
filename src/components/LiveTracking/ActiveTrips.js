import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';

const ActiveTrips = ({ trips, onTripSelect }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        טיולים פעילים
      </Typography>

      {trips.length === 0 ? (
        <Box sx={{ 
          p: 2, 
          textAlign: 'center',
          color: 'text.secondary'
        }}>
          <Typography>אין טיולים פעילים כרגע</Typography>
        </Box>
      ) : (
        <List>
          {trips.map((trip) => (
            <ListItem
              key={trip.id}
              component={Paper}
              elevation={1}
              sx={{ 
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {trip.name}
                  </Typography>
                  <Chip 
                    size="small"
                    label={trip.status}
                    color={trip.status === 'בדרך' ? 'success' : 'primary'}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {trip.participantsCount} משתתפים
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" noWrap>
                    {trip.currentLocation}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    עדכון אחרון: {new Date(trip.lastUpdate).toLocaleTimeString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Tooltip title="נווט למיקום במפה">
                    <IconButton 
                      size="small"
                      onClick={() => onTripSelect(trip)}
                      color="primary"
                    >
                      <NavigationIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ActiveTrips;
