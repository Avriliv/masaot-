import React from 'react';
import { Box, Typography } from '@mui/material';
import LocationAutocomplete from './LocationAutocomplete';

const DailyLocationsRenderer = ({ 
    dailyLocations = [], 
    onLocationChange, 
    onLocationSelect 
}) => {
    return (
        <Box>
            {dailyLocations.map((day, dayIndex) => (
                <Box key={dayIndex} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        יום {dayIndex + 1} - {new Date(day.date).toLocaleDateString('he-IL')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <LocationAutocomplete
                            label="מיקום התחלה"
                            value={day.locations[0] || null}
                            onChange={(location) => onLocationChange(dayIndex, 0, location)}
                            onSelect={(location) => onLocationSelect(dayIndex, 0, location)}
                        />
                        <LocationAutocomplete
                            label="מיקום סיום"
                            value={day.locations[1] || null}
                            onChange={(location) => onLocationChange(dayIndex, 1, location)}
                            onSelect={(location) => onLocationSelect(dayIndex, 1, location)}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default DailyLocationsRenderer;
