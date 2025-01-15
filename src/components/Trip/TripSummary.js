import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  DirectionsBus as TransportIcon,
  Hotel as AccommodationIcon,
  Restaurant as FoodIcon,
  Backpack as EquipmentIcon,
  Save,
  Print,
  Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HikingMap from '../Map/HikingMap';
import { useTrip } from '../../context/TripContext';

const TripSummary = () => {
  const navigate = useNavigate();
  const { tripState, updateStatus } = useTrip();

  const handleSave = () => {
    // שמירת סטטוס הטיול כ"הושלם"
    updateStatus('completed');
    
    // שמירת זמן העדכון האחרון
    // dispatch({
    //   type: 'UPDATE_LAST_MODIFIED',
    //   payload: new Date().toISOString()
    // });

    // ניווט לדף הטיולים שלי
    navigate('/my-trips');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: שיתוף הטיול
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL');
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom>
        סיכום הטיול
      </Typography>

      <Grid container spacing={3}>
        {/* פרטים בסיסיים */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטים בסיסיים
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="שם הטיול" 
                  secondary={tripState.basicDetails.tripName || 'לא הוגדר'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="תאריכים" 
                  secondary={`${formatDate(tripState.basicDetails.startDate)} - ${formatDate(tripState.basicDetails.endDate)}`} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="מספר משתתפים" 
                  secondary={`${tripState.basicDetails.participantsCount || 0} משתתפים`} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* מפת המסלול */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Typography variant="h6" gutterBottom>
              מפת המסלול
            </Typography>
            <HikingMap readonly={true} />
          </Paper>
        </Grid>

        {/* לוגיסטיקה */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              פרטים לוגיסטיים
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <TransportIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">הסעות</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tripState.logistics?.transportation || 'לא הוגדר'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <AccommodationIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">לינה</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tripState.logistics?.accommodation || 'לא הוגדר'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <FoodIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">כלכלה</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tripState.logistics?.food || 'לא הוגדר'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <EquipmentIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">ציוד</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tripState.logistics?.equipment || 'לא הוגדר'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* כפתורי פעולה */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 3 
      }}>
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShare}
        >
          שתף
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
        >
          הדפס
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          סיים תכנון
        </Button>
      </Box>
    </Box>
  );
};

export default TripSummary;
