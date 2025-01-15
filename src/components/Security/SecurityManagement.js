import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  WbSunny as WeatherIcon,
  LocalHospital as EmergencyIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import StandaloneMap from '../Map/StandaloneMap';

const SecurityManagement = () => {
  const [activeTrips, setActiveTrips] = useState([
    {
      id: 1,
      name: 'טיול לגליל',
      location: { lat: 32.9316, lng: 35.3212 },
      participants: 45,
      status: 'active',
      lastUpdate: new Date(),
      weather: {
        temp: 28,
        condition: 'sunny',
        warning: null
      }
    }
  ]);

  const emergencyContacts = [
    { name: 'חדר מצב', phone: '02-6222211' },
    { name: 'משטרה', phone: '100' },
    { name: 'מד"א', phone: '101' },
    { name: 'כיבוי אש', phone: '102' }
  ];

  const emergencyPoints = [
    { name: 'בית חולים העמק', location: 'עפולה', distance: '15 ק"מ' },
    { name: 'תחנת משטרה', location: 'נצרת', distance: '8 ק"מ' },
    { name: 'נקודת חילוץ', location: 'הר תבור', distance: '5 ק"מ' }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* כותרת */}
        <Typography variant="h5" component="h1" gutterBottom>
          בטיחות ואבטחה
        </Typography>

        <Grid container spacing={3}>
          {/* מפה */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                מפת מסלול ונקודות חירום
              </Typography>
              <Box sx={{ height: '500px', width: '100%' }}>
                <StandaloneMap isStandalone={false} />
              </Box>
            </Paper>
          </Grid>

          {/* טיולים פעילים */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                טיולים פעילים
              </Typography>
              {activeTrips.map(trip => (
                <Card key={trip.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {trip.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trip.participants} משתתפים
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {trip.location.lat}, {trip.location.lng}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WeatherIcon sx={{ mr: 1, color: '#f9a825' }} />
                          <Typography variant="body2">
                            {trip.weather.temp}°C, {trip.weather.condition}
                          </Typography>
                        </Box>
                        {trip.weather.warning && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            {trip.weather.warning}
                          </Alert>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>

          {/* אנשי קשר לחירום */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                אנשי קשר לחירום
              </Typography>
              <List>
                {emergencyContacts.map((contact, index) => (
                  <React.Fragment key={contact.name}>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={contact.name}
                        secondary={contact.phone}
                      />
                      <IconButton size="small" onClick={() => window.open(`tel:${contact.phone}`)}>
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < emergencyContacts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* נקודות חירום */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  נקודות חירום במסלול
                </Typography>
                <Button startIcon={<AddIcon />}>
                  הוסף נקודה
                </Button>
              </Box>
              <Grid container spacing={2}>
                {emergencyPoints.map(point => (
                  <Grid item xs={12} sm={6} md={4} key={point.name}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmergencyIcon color="error" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">
                            {point.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          מיקום: {point.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          מרחק: {point.distance}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SecurityManagement;
