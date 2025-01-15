import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Restaurant as FoodIcon,
  LocalDrink as WaterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const TripLogistics = ({ tripId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // מצב המערכת
  const [transportation, setTransportation] = useState({
    company: 'אגד היסעים',
    contactName: 'דוד כהן',
    phone: '050-1234567',
    busCount: 2,
    pickupLocation: 'חניון בית הספר',
    pickupTime: '07:00'
  });

  const [meals, setMeals] = useState([
    { 
      id: 1, 
      type: 'ארוחת בוקר',
      time: '08:30',
      location: 'נקודת עצירה - צומת גולני',
      details: 'כריכים + פירות'
    },
    { 
      id: 2, 
      type: 'ארוחת צהריים',
      time: '13:00',
      location: 'חניון הר תבור',
      details: 'אוכל חם - קייטרינג'
    }
  ]);

  const [equipment, setEquipment] = useState([
    { id: 1, item: 'מים (5 ליטר לתלמיד)', quantity: 50, status: 'סופק' },
    { id: 2, item: 'ערכת עזרה ראשונה', quantity: 3, status: 'חסר' },
    { id: 3, item: 'אפודים זוהרים', quantity: 60, status: 'סופק' }
  ]);

  const [editDialog, setEditDialog] = useState(false);
  const [editMeal, setEditMeal] = useState(null);
  const [error, setError] = useState(null);

  // טיפול בעריכת ארוחה
  const handleEditMeal = (meal) => {
    setEditMeal(meal);
    setEditDialog(true);
  };

  const handleSaveMeal = () => {
    if (editMeal?.id) {
      setMeals(prev => 
        prev.map(m => m.id === editMeal.id ? editMeal : m)
      );
    } else {
      setMeals(prev => [
        ...prev,
        { ...editMeal, id: Math.max(...prev.map(m => m.id)) + 1 }
      ]);
    }
    setEditDialog(false);
    setEditMeal(null);
  };

  const handleDeleteMeal = (id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  // טיפול בעדכון סטטוס ציוד
  const toggleEquipmentStatus = (id) => {
    setEquipment(prev =>
      prev.map(item =>
        item.id === id 
          ? { ...item, status: item.status === 'סופק' ? 'חסר' : 'סופק' }
          : item
      )
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        color="primary" 
        fontWeight="bold"
        gutterBottom
      >
        ניהול לוגיסטיקה
      </Typography>

      <Grid container spacing={3}>
        {/* הסעות */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">הסעות</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <TextField
                label="חברת הסעות"
                value={transportation.company}
                onChange={(e) => setTransportation(prev => ({ ...prev, company: e.target.value }))}
                fullWidth
              />
              <TextField
                label="איש קשר"
                value={transportation.contactName}
                onChange={(e) => setTransportation(prev => ({ ...prev, contactName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="טלפון"
                value={transportation.phone}
                onChange={(e) => setTransportation(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
              />
              <TextField
                label="מספר אוטובוסים"
                type="number"
                value={transportation.busCount}
                onChange={(e) => setTransportation(prev => ({ ...prev, busCount: e.target.value }))}
                fullWidth
              />
              <TextField
                label="נקודת איסוף"
                value={transportation.pickupLocation}
                onChange={(e) => setTransportation(prev => ({ ...prev, pickupLocation: e.target.value }))}
                fullWidth
              />
              <TextField
                label="שעת איסוף"
                type="time"
                value={transportation.pickupTime}
                onChange={(e) => setTransportation(prev => ({ ...prev, pickupTime: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* ארוחות */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FoodIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">ארוחות</Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditMeal({
                    type: '',
                    time: '',
                    location: '',
                    details: ''
                  });
                  setEditDialog(true);
                }}
                size={isMobile ? "small" : "medium"}
              >
                הוסף ארוחה
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
              {meals.map((meal) => (
                <ListItem
                  key={meal.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="ערוך">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleEditMeal(meal)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDeleteMeal(meal.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <FoodIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {meal.type}
                        <Chip 
                          label={meal.time} 
                          size="small"
                          icon={<ScheduleIcon />}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon fontSize="small" />
                          {meal.location}
                        </Box>
                        {meal.details}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ציוד */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WaterIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">ציוד</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {equipment.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {item.item}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            כמות: {item.quantity}
                          </Typography>
                        </Box>
                        <Tooltip title={item.status === 'סופק' ? 'סופק' : 'חסר'}>
                          <IconButton
                            onClick={() => toggleEquipmentStatus(item.id)}
                            color={item.status === 'סופק' ? "primary" : "default"}
                            size="small"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* דיאלוג עריכת ארוחה */}
      <Dialog 
        open={editDialog} 
        onClose={() => {
          setEditDialog(false);
          setEditMeal(null);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editMeal?.id ? 'עריכת ארוחה' : 'הוספת ארוחה'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>סוג ארוחה</InputLabel>
              <Select
                value={editMeal?.type || ''}
                label="סוג ארוחה"
                onChange={(e) => setEditMeal(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="ארוחת בוקר">ארוחת בוקר</MenuItem>
                <MenuItem value="ארוחת צהריים">ארוחת צהריים</MenuItem>
                <MenuItem value="ארוחת ערב">ארוחת ערב</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="שעה"
              type="time"
              value={editMeal?.time || ''}
              onChange={(e) => setEditMeal(prev => ({ ...prev, time: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="מיקום"
              value={editMeal?.location || ''}
              onChange={(e) => setEditMeal(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
            />
            <TextField
              label="פרטים נוספים"
              value={editMeal?.details || ''}
              onChange={(e) => setEditMeal(prev => ({ ...prev, details: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setEditMeal(null);
          }}>
            ביטול
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveMeal}
            disabled={!editMeal?.type || !editMeal?.time || !editMeal?.location}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripLogistics;
