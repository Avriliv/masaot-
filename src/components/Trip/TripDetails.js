import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentTrip, updateTrip } from '../../redux/slices/tripsSlice';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  Slide
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  DirectionsBus as DirectionsBusIcon,
  LocalHospital as LocalHospitalIcon,
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Timer as DurationIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import EmergencyContacts from './EmergencyContacts';
import LocationHistory from './LocationHistory';
import ParentalApproval from './Forms/ParentalApproval';
import BusInspectionForm from './Forms/BusInspectionForm';
import TripChecklist from './TripChecklist';
import StudentsList from './StudentsList';  
import EnhancedEquipmentList from './EnhancedEquipmentList';
import SOSService from '../../services/SOSService';
import LocationService from '../../services/LocationService'; 

const TripDetails = () => {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const trip = useSelector(selectCurrentTrip);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // DEBUG: נדפיס את האובייקט שמגיע
  console.log('Trip ID:', tripId);
  console.log('Trip from Redux:', trip);

  const tripData = {
    ...trip,
    emergencyContacts: trip?.emergencyContacts || [],
    locationHistory: trip?.locationHistory || [],
    status: trip?.status || 'בתכנון',
    basicDetails: {
      ...trip?.basicDetails,
      tripName: trip?.basicDetails?.tripName || trip?.title || 'טיול חדש',
      startDate: trip?.basicDetails?.startDate || '',
      endDate: trip?.basicDetails?.endDate || '',
      location: trip?.basicDetails?.location || trip?.location || 'לא הוגדר',
      numStudents: trip?.basicDetails?.numStudents || 0,
      numStaff: trip?.basicDetails?.numStaff || 0,
      duration: trip?.basicDetails?.duration || (trip?.basicDetails?.startDate && trip?.basicDetails?.endDate ? 
        `${Math.ceil((new Date(trip?.basicDetails?.endDate) - new Date(trip?.basicDetails?.startDate)) / (1000 * 60 * 60 * 24))} ימים` : 
        'לא הוגדר')
    }
  };

  // DEBUG: נדפיס את האובייקט המעובד
  console.log('Processed tripData:', tripData);

  const [emergencyContacts, setEmergencyContacts] = useState(tripData.emergencyContacts);
  const [locationHistory, setLocationHistory] = useState(tripData.locationHistory);
  const [isTracking, setIsTracking] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [value, setValue] = useState(0);
  const [selectedForm, setSelectedForm] = useState(0);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (trip) {
      dispatch(updateTrip({
        ...trip,
        emergencyContacts,
        locationHistory
      }));
    }
  }, [emergencyContacts, locationHistory, dispatch, trip]);

  useEffect(() => {
    if (!isTracking) return;

    const checkAndAddLocation = async () => {
      try {
        const location = await LocationService.getCurrentLocation(setLocationStatus);
        const now = new Date();
        const lastLocation = locationHistory[locationHistory.length - 1];
        if (!lastLocation || 
            now.getTime() - new Date(lastLocation.timestamp).getTime() >= 60 * 60 * 1000) {
          setLocationHistory(prev => [...prev, {
            ...location,
            timestamp: now
          }]);
        }
      } catch (error) {
        setLocationStatus("שגיאה בקבלת המיקום");
        console.error('Error getting location:', error);
      }
    };

    checkAndAddLocation();
    
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() === 0 && now.getSeconds() === 0) {
        checkAndAddLocation();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const handleSOS = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      const result = await SOSService.sendSOSAlert(trip, currentLocation);
      
      if (result.success) {
        console.log('SOS alert sent successfully');
      } else {
        console.error('Failed to send SOS alert:', result.error);
      }
    } catch (error) {
      console.error('Error sending SOS alert:', error);
    }
  };

  const handleStartTracking = () => {
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const InfoItem = ({ icon: Icon, text }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: { xs: 2, sm: 1 },
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        gap: 1
      }}
    >
      <Icon sx={{ color: 'primary.main', fontSize: isMobile ? '2rem' : '1.5rem' }} />
      <Typography variant={isMobile ? "body2" : "body1"}>
        {text}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {tripData.basicDetails?.tripName || 'טיול חדש'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {tripData.status}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem
              icon={CalendarIcon}
              text={tripData.basicDetails?.startDate ? 
                `תאריך: ${new Date(tripData.basicDetails.startDate).toLocaleDateString('he-IL')} - ${new Date(tripData.basicDetails.endDate).toLocaleDateString('he-IL')}` :
                'תאריך: לא נקבע'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem
              icon={LocationIcon}
              text={`מסלול: ${tripData.basicDetails?.location || 'לא הוגדר'}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem
              icon={PeopleIcon}
              text={`משתתפים: ${(tripData.basicDetails?.numStudents || 0) + (tripData.basicDetails?.numStaff || 0)}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoItem
              icon={DurationIcon}
              text={`משך: ${tripData.basicDetails?.duration || 'לא הוגדר'}`}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="trip details tabs">
          <Tab label="צ'קליסט" />
          <Tab label="רשימת תלמידים" />
          <Tab label="ציוד" />
          <Tab label="אנשי קשר לחירום" />
          <Tab label="מעקב מיקום" />
          <Tab label="טפסים ואישורים" />
        </Tabs>
      </Box>

      {value === 0 && <TripChecklist tripId={trip?.id} onChecklistUpdate={(checklist) => {
        if (trip) {
          dispatch(updateTrip({
            ...trip,
            checklist
          }));
        }
      }} />}
      {value === 1 && (
        <StudentsList
          tripId={trip?.id}
          onStudentsChange={setStudents}
          onSendForms={() => {
            setValue(5); // מעבר לטאב טפסים
            setSelectedForm(0); // בחירת טופס אישור הורים
          }}
        />
      )}
      {value === 2 && <EnhancedEquipmentList />}
      {value === 3 && <EmergencyContacts contacts={emergencyContacts} setContacts={setEmergencyContacts} />}
      {value === 4 && (
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartTracking}
            disabled={locationStatus === "tracking"}
            sx={{ mb: 2 }}
          >
            {locationStatus === "tracking" ? "מעקב מיקום פעיל" : "התחל מעקב מיקום"}
          </Button>
          <LocationHistory history={locationHistory} />
        </Box>
      )}
      {value === 5 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            טפסים ואישורים
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => setSelectedForm(selectedForm === 0 ? null : 0)}
              >
                <GroupIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  טופס אישור הורים
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  אישור השתתפות בטיול וחתימת הורים
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => setSelectedForm(selectedForm === 1 ? null : 1)}
              >
                <DirectionsBusIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  טופס בדיקת אוטובוס
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  בדיקת תקינות ובטיחות האוטובוס
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  opacity: 0.6
                }}
              >
                <LocalHospitalIcon color="disabled" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" color="text.disabled" gutterBottom>
                  אישור רפואי
                </Typography>
                <Typography variant="body2" color="text.disabled" align="center">
                  יתווסף בקרוב...
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  opacity: 0.6
                }}
              >
                <SchoolIcon color="disabled" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" color="text.disabled" gutterBottom>
                  אישור בית ספר
                </Typography>
                <Typography variant="body2" color="text.disabled" align="center">
                  יתווסף בקרוב...
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {selectedForm !== null && (
            <Dialog
              open={selectedForm !== null}
              onClose={() => setSelectedForm(null)}
              maxWidth="md"
              fullWidth
              TransitionComponent={Slide}
              TransitionProps={{ direction: "up" }}
              PaperProps={{
                sx: {
                  minHeight: '80vh',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }
              }}
            >
              <DialogContent>
                {selectedForm === 0 && (
                  <ParentalApproval tripData={tripData} students={students} />
                )}
                {selectedForm === 1 && (
                  <BusInspectionForm tripData={tripData} />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedForm(null)}>סגור</Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TripDetails;
