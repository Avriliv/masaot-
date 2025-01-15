// src/components/trips/MyTrips.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon
} from '@mui/icons-material';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([
    {
      id: 1,
      name: 'טיול בהרי הגליל',
      date: new Date('2025-01-10'),
      route: 'הר מירון - נחל עמוד',
      participants: 25,
      description: 'טיול יומי בשביל ישראל',
      emergencyContacts: [],
      locationHistory: []
    }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: '',
    date: '',
    route: '',
    participants: '',
    description: ''
  });

  const handleAddTrip = () => {
    if (newTrip.name && newTrip.date) {
      setTrips(prev => [...prev, {
        ...newTrip,
        id: Date.now(),
        emergencyContacts: [],
        locationHistory: []
      }]);
      setOpenDialog(false);
      setNewTrip({
        name: '',
        date: '',
        route: '',
        participants: '',
        description: ''
      });
    }
  };

  const handleDeleteTrip = (tripId) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">הטיולים שלי</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          טיול חדש
        </Button>
      </Box>

      <List>
        {trips.map((trip) => (
          <Paper key={trip.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={trip.name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" display="block">
                      תאריך: {new Date(trip.date).toLocaleDateString()}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      מסלול: {trip.route}
                    </Typography>
                    <Typography component="span" variant="body2" display="block">
                      משתתפים: {trip.participants}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => navigate(`/trips/${trip.id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => navigate(`/live-tracking/${trip.id}`)}>
                  <MapIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteTrip(trip.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוספת טיול חדש</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם הטיול"
            fullWidth
            value={newTrip.name}
            onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="תאריך"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTrip.date}
            onChange={(e) => setNewTrip({ ...newTrip, date: e.target.value })}
          />
          <TextField
            margin="dense"
            label="מסלול"
            fullWidth
            value={newTrip.route}
            onChange={(e) => setNewTrip({ ...newTrip, route: e.target.value })}
          />
          <TextField
            margin="dense"
            label="מספר משתתפים"
            type="number"
            fullWidth
            value={newTrip.participants}
            onChange={(e) => setNewTrip({ ...newTrip, participants: e.target.value })}
          />
          <TextField
            margin="dense"
            label="תיאור"
            fullWidth
            multiline
            rows={4}
            value={newTrip.description}
            onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleAddTrip} color="primary" variant="contained">
            הוסף טיול
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTrips;
