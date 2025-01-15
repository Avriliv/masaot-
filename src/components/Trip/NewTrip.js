import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Container,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import { 
  Home as HomeIcon, 
  ExpandMore as ExpandMoreIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// יצירת theme עם תמיכה ב-RTL
const theme = createTheme({
  direction: 'rtl',
});

// יצירת cache עם תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// רשימת מקומות לדוגמה (יש להחליף עם API אמיתי)
const israelLocations = [
  'הר מירון',
  'מכתש רמון',
  'עין גדי',
  'הר הרצל',
  'מצדה',
  'נחל דוד',
  'חוף דור',
  'הר תבור',
  'ראש הנקרה',
  'עין עבדת'
];

const gradeOptions = [
  'כיתה א׳',
  'כיתה ב׳',
  'כיתה ג׳',
  'כיתה ד׳',
  'כיתה ה׳',
  'כיתה ו׳',
  'כיתה ז׳',
  'כיתה ח׳',
  'כיתה ט׳',
  'כיתה י׳',
  'כיתה י״א',
  'כיתה י״ב',
  'אחר'
];

const organizationTypes = [
  'בית ספר',
  'תנועת נוער',
  'מכינה קדם צבאית',
  'צבא',
  'מועצה מקומית',
  'אחר'
];

const NewTrip = ({ onSubmit, onBack, submitButtonText, backButtonText, submitButtonIcon }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tripName: '',
    description: '',
    startDate: '',
    endDate: '',
    grade: '',
    type: '',
    numberOfDays: '',
    startLocation: '',
    endLocation: '',
    organizationType: ''
  });

  const [showLocationFields, setShowLocationFields] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      if (name === 'numberOfDays' && value) {
        setShowLocationFields(true);
      }
      
      return newData;
    });
  };

  const handleLocationChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheRtl}>
        <Container maxWidth="md">
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="right">
              יצירת טיול חדש
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="tripName"
                  label="שם הטיול"
                  value={formData.tripName}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="תיאור הטיול"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="startDate"
                  label="תאריך התחלה"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="endDate"
                  label="תאריך סיום"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="numberOfDays"
                  label="מספר ימים"
                  type="number"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {showLocationFields && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      options={israelLocations}
                      value={formData.startLocation}
                      onChange={(event, newValue) => handleLocationChange('startLocation', newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="מיקום התחלה"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      fullWidth
                      options={israelLocations}
                      value={formData.endLocation}
                      onChange={(event, newValue) => handleLocationChange('endLocation', newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="מיקום סיום"
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>קבוצת גיל</InputLabel>
                  <Select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    label="קבוצת גיל"
                  >
                    {gradeOptions.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>סוג ארגון</InputLabel>
                  <Select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleInputChange}
                    label="סוג ארגון"
                  >
                    {organizationTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={onBack}
              >
                {backButtonText}
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                endIcon={submitButtonIcon}
              >
                {submitButtonText}
              </Button>
            </Box>
          </Box>
        </Container>
      </CacheProvider>
    </ThemeProvider>
  );
};

export default NewTrip;
