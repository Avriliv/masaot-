import React, { useState } from 'react';
import {
    Box,
    TextField,
    Grid,
    MenuItem,
    Typography,
    FormControl,
    InputLabel,
    Select,
    DatePicker,
    InputAdornment,
    Button,
    Paper,
    Alert,
    Divider
} from '@mui/material';
import { useTrip } from '../../../context/TripContext';
import SearchLocation from './SearchLocation';

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
    'כיתה י״ב'
];

const organizationTypes = [
    'בית ספר',
    'תנועת נוער',
    'מכינה קדם צבאית',
    'צבא',
    'מועצה מקומית',
    'אחר'
];

export default function TripDetails({ onNext }) {
    const { tripState, updateTrip } = useTrip();
    const { basicDetails } = tripState;

    const handleStartPointSelect = (location) => {
        console.log('Selected start point:', location);
        updateTrip({
            route: {
                ...tripState.route,
                startPoint: location
            }
        });
    };

    const handleEndPointSelect = (location) => {
        console.log('Selected end point:', location);
        updateTrip({
            route: {
                ...tripState.route,
                endPoint: location
            }
        });
    };

    const handleBasicDetailsChange = (field, value) => {
        updateTrip({
            basicDetails: {
                ...basicDetails,
                [field]: value
            }
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    פרטים בסיסיים
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>סוג הארגון</InputLabel>
                            <Select
                                value={basicDetails?.organizationType || ''}
                                onChange={(e) => handleBasicDetailsChange('organizationType', e.target.value)}
                            >
                                {organizationTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>כיתה</InputLabel>
                            <Select
                                value={basicDetails?.grade || ''}
                                onChange={(e) => handleBasicDetailsChange('grade', e.target.value)}
                            >
                                {gradeOptions.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="מספר תלמידים"
                            type="number"
                            value={basicDetails?.numberOfStudents || ''}
                            onChange={(e) => handleBasicDetailsChange('numberOfStudents', e.target.value)}
                            InputProps={{
                                inputProps: { min: 1 }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    פרטי המסלול
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            נקודת התחלה
                        </Typography>
                        <SearchLocation 
                            onLocationSelect={handleStartPointSelect} 
                            onSelectLocation={handleStartPointSelect} 
                        />
                        {tripState.route?.startPoint && (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                נבחרה נקודת התחלה: {tripState.route.startPoint.name}
                            </Alert>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            נקודת סיום
                        </Typography>
                        <SearchLocation 
                            onLocationSelect={handleEndPointSelect} 
                            onSelectLocation={handleEndPointSelect} 
                        />
                        {tripState.route?.endPoint && (
                            <Alert severity="success" sx={{ mt: 1 }}>
                                נבחרה נקודת סיום: {tripState.route.endPoint.name}
                            </Alert>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="מספר ימי טיול"
                            type="number"
                            value={basicDetails?.numberOfDays || ''}
                            onChange={(e) => handleBasicDetailsChange('numberOfDays', e.target.value)}
                            InputProps={{
                                inputProps: { min: 1 }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
