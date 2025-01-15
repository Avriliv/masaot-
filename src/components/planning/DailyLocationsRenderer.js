import React, { memo } from 'react';
import { Grid, Typography } from '@mui/material';
import LocationAutocomplete from './LocationAutocomplete';

const DailyLocationsRenderer = memo(({ 
    numDays, 
    dailyLocations, 
    onLocationChange, 
    locations, 
    loading, 
    onSearchChange 
}) => {
    if (!numDays || numDays <= 0) return null;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    מיקומי הטיול
                </Typography>
            </Grid>
            {Array.from({ length: parseInt(numDays) }).map((_, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={12} sm={6}>
                        <LocationAutocomplete
                            label={`מיקום התחלה - יום ${index + 1}`}
                            value={dailyLocations?.[index]?.startLocation || null}
                            onChange={(location) => {
                                // בדיקה שהמיקום תקין לפני העברה
                                if (location && location.name && location.coordinates) {
                                    onLocationChange(index, 'startLocation', location);
                                } else {
                                    onLocationChange(index, 'startLocation', null);
                                }
                            }}
                            error={!dailyLocations?.[index]?.startLocation && index === 0}
                            helperText={!dailyLocations?.[index]?.startLocation && index === 0 ? 'נדרש מיקום התחלה' : ''}
                            locations={locations}
                            loading={loading}
                            onInputChange={onSearchChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocationAutocomplete
                            label={`מיקום סיום - יום ${index + 1}`}
                            value={dailyLocations?.[index]?.endLocation || null}
                            onChange={(location) => {
                                // בדיקה שהמיקום תקין לפני העברה
                                if (location && location.name && location.coordinates) {
                                    onLocationChange(index, 'endLocation', location);
                                } else {
                                    onLocationChange(index, 'endLocation', null);
                                }
                            }}
                            error={!dailyLocations?.[index]?.endLocation && index === 0}
                            helperText={!dailyLocations?.[index]?.endLocation && index === 0 ? 'נדרש מיקום סיום' : ''}
                            locations={locations}
                            loading={loading}
                            onInputChange={onSearchChange}
                        />
                    </Grid>
                </React.Fragment>
            ))}
        </Grid>
    );
});

DailyLocationsRenderer.displayName = 'DailyLocationsRenderer';

export default DailyLocationsRenderer;
