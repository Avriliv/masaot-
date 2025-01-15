import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Alert,
  Paper
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import EmergencyContacts from './EmergencyContacts';
import LocationHistory from './LocationHistory';

const TripDetails = () => {
  const { tripId } = useParams();
  const [value, setValue] = useState(0);
  const [trip, setTrip] = useState({
    id: 1,
    name: 'טיול בהרי הגליל',
    date: new Date('2025-01-10'),
    route: 'הר מירון - נחל עמוד',
    participants: 25,
    description: 'טיול יומי בשביל ישראל',
    emergencyContacts: [],
    locationHistory: []
  });

  const [isTracking, setIsTracking] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSOS = () => {
    // כאן נפעיל את שירות ה-SOS
    console.log('SOS activated');
  };

  const handleStartTracking = () => {
    setIsTracking(true);
    // כאן נתחיל לעקוב אחר המיקום
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    // כאן נפסיק לעקוב אחר המיקום
  };

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>{trip.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {new Date(trip.date).toLocaleDateString()} | {trip.participants} משתתפים
        </Typography>
      </Box>

      <Box mb={3} display="flex" gap={2}>
        <Button
          variant="contained"
          color="error"
          startIcon={<WarningIcon />}
          onClick={handleSOS}
        >
          SOS
        </Button>
        
        {isTracking ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LocationIcon />}
            onClick={handleStopTracking}
          >
            הפסק מעקב מיקום
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LocationIcon />}
            onClick={handleStartTracking}
          >
            התחל מעקב מיקום
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="פרטי טיול" />
          <Tab label="אנשי קשר לחירום" />
          <Tab label="היסטוריית מיקומים" />
        </Tabs>
      </Paper>

      {value === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>מסלול</Typography>
          <Typography paragraph>{trip.route}</Typography>
          
          <Typography variant="h6" gutterBottom>תיאור</Typography>
          <Typography paragraph>{trip.description}</Typography>
        </Box>
      )}

      {value === 1 && (
        <EmergencyContacts
          contacts={trip.emergencyContacts}
          onContactsChange={(newContacts) => {
            setTrip(prev => ({
              ...prev,
              emergencyContacts: newContacts
            }));
          }}
        />
      )}

      {value === 2 && (
        <LocationHistory locations={trip.locationHistory} />
      )}
    </Box>
  );
};

export default TripDetails;
