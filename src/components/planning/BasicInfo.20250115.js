import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { debounce } from 'lodash';
import { Box, Paper, Snackbar, Alert, Grid, TextField, Autocomplete } from '@mui/material';
import { getLocalHikingRoute } from '../../services/LocalOSRMService';
import { locationSearchCache } from '../../services/LocationSearchCache';
import DailyLocationsRenderer from './DailyLocationsRenderer';
import TripDetailsForm from './TripDetailsForm';

const BasicInfo = ({ onSubmit }) => {
    const { tripData, updateBasicDetails, updateDailyLocations } = useTrip();
    const [formData, setFormData] = useState({
        tripName: tripData?.basicDetails?.tripName || '',
        startDate: tripData?.basicDetails?.startDate || '',
        endDate: tripData?.basicDetails?.endDate || '',
        numDays: tripData?.basicDetails?.numDays || '',
        gradeFrom: tripData?.basicDetails?.gradeFrom || '',
        gradeTo: tripData?.basicDetails?.gradeTo || '',
        organizationType: tripData?.basicDetails?.organizationType || '',
        organization: tripData?.basicDetails?.organization || '',
        numStudents: tripData?.basicDetails?.numStudents || '',
        numStaff: tripData?.basicDetails?.numStaff || '',
        description: tripData?.basicDetails?.description || '',
        dailyLocations: tripData?.basicDetails?.dailyLocations || []
    });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

    // עדכון הטופס כשהנתונים משתנים בקונטקסט
    useEffect(() => {
        setFormData({
            tripName: tripData?.basicDetails?.tripName || '',
            startDate: tripData?.basicDetails?.startDate || '',
            endDate: tripData?.basicDetails?.endDate || '',
            numDays: tripData?.basicDetails?.numDays || '',
            gradeFrom: tripData?.basicDetails?.gradeFrom || '',
            gradeTo: tripData?.basicDetails?.gradeTo || '',
            organizationType: tripData?.basicDetails?.organizationType || '',
            organization: tripData?.basicDetails?.organization || '',
            numStudents: tripData?.basicDetails?.numStudents || '',
            numStaff: tripData?.basicDetails?.numStaff || '',
            description: tripData?.basicDetails?.description || '',
            dailyLocations: tripData?.basicDetails?.dailyLocations || []
        });
    }, [tripData.basicDetails]);

    // חישוב שגיאות תאריכים
    const { startDateError, endDateError } = useMemo(() => {
        const start = formData.startDate ? new Date(formData.startDate) : null;
        const end = formData.endDate ? new Date(formData.endDate) : null;
        
        // נשווה את התאריכים ללא שעות
        const compareStart = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
        const compareEnd = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;
        
        return {
            startDateError: start && end && compareStart > compareEnd,
            endDateError: start && end && compareEnd < compareStart
        };
    }, [formData.startDate, formData.endDate]);

    // טיפול בשינוי שדות
    const handleInputChange = useCallback((field) => (value) => {
        const newData = { ...formData };

        if (field === 'startDate' || field === 'endDate') {
            newData[field] = value;
            if (newData.startDate && newData.endDate) {
                const start = new Date(newData.startDate);
                const end = new Date(newData.endDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                newData.numDays = diffDays.toString();
            }
        } else {
            newData[field] = value;
        }

        setFormData(newData);
        updateBasicDetails(newData);
    }, [formData, updateBasicDetails]);

    // חיפוש מיקומים
    const searchLocations = useCallback(async (searchText) => {
        if (!searchText || searchText.length < 2) return [];

        try {
            const params = new URLSearchParams({
                q: searchText,
                format: 'json',
                countrycodes: 'il',
                limit: 10,
                addressdetails: 1,
                accept_language: 'he'
            });

            const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
                headers: {
                    'Accept-Language': 'he'
                }
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();
            
            // מסנן תוצאות לפי גבולות ישראל
            const israelBounds = {
                south: 29.4,  // אילת
                west: 34.2,   // מערב הנגב
                north: 33.4,  // הר דב
                east: 35.9    // רמת הגולן
            };

            return data
                .filter(item => {
                    const lat = parseFloat(item.lat);
                    const lon = parseFloat(item.lon);
                    return lat >= israelBounds.south && 
                           lat <= israelBounds.north && 
                           lon >= israelBounds.west && 
                           lon <= israelBounds.east;
                })
                .map(item => ({
                    name: item.display_name.split(',')[0],
                    address: item.display_name,
                    id: parseInt(item.place_id),
                    coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
                    type: item.type,
                    category: item.category,
                    importance: parseFloat(item.importance)
                }));
        } catch (error) {
            console.error('Error searching locations:', error);
            setError('אירעה שגיאה בחיפוש המיקומים');
            return [];
        }
    }, []);

    // חיפוש מיקומים עם מטמון
    const debouncedSearch = useCallback(
        debounce(async (text) => {
            if (!text || text.length < 2) {
                setLocations([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const results = await locationSearchCache.search(text, searchLocations);
                setLocations(results);
                setError(null);
            } catch (err) {
                console.error('Error searching locations:', err);
                setError('אירעה שגיאה בחיפוש המיקומים');
                setLocations([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [searchLocations]
    );

    // עדכון מסלול
    const updateRoute = useCallback(async (startLocation, endLocation) => {
        try {
            const routeData = await getLocalHikingRoute(
                startLocation.coordinates,
                endLocation.coordinates
            );

            return {
                startPoint: startLocation,
                endPoint: endLocation,
                geometry: routeData.geometry,
                distance: routeData.distance,
                duration: routeData.duration,
                elevation: {
                    ascent: 0,
                    descent: 0
                }
            };
        } catch (error) {
            console.error('Error fetching route:', error);
            setError('אירעה שגיאה בחישוב המסלול');
            return null;
        }
    }, []);

    // טיפול בשינוי מיקום
    const handleLocationChange = useCallback(async (dayIndex, locationType, newLocation) => {
        const newDailyLocations = [...formData.dailyLocations];
        
        if (!newDailyLocations[dayIndex]) {
            newDailyLocations[dayIndex] = { startLocation: null, endLocation: null };
        }

        // עדכון המיקום הספציפי
        newDailyLocations[dayIndex] = {
            ...newDailyLocations[dayIndex],
            [locationType]: newLocation
        };

        // חישוב מסלול רק אם יש נקודת התחלה וסיום
        const currentDay = newDailyLocations[dayIndex];
        if (currentDay.startLocation?.coordinates && currentDay.endLocation?.coordinates) {
            try {
                const route = await getLocalHikingRoute(
                    currentDay.startLocation.coordinates,
                    currentDay.endLocation.coordinates
                );

                if (route) {
                    newDailyLocations[dayIndex] = {
                        ...newDailyLocations[dayIndex],
                        route: {
                            ...route,
                            properties: {
                                ...route.properties,
                                day: dayIndex + 1
                            }
                        }
                    };
                }
            } catch (error) {
                console.error('Error calculating route:', error);
                setError('שגיאה בחישוב המסלול');
            }
        }

        // עדכון ה-state המקומי וה-context
        const newFormData = { ...formData, dailyLocations: newDailyLocations };
        setFormData(newFormData);
        updateBasicDetails(newFormData);
    }, [formData, updateBasicDetails]);

    return (
        <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                {/* טופס פרטים בסיסיים */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="שם הטיול"
                            name="tripName"
                            value={formData.tripName || ''}
                            onChange={(e) => handleInputChange('tripName')(e.target.value)}
                            error={!formData.tripName}
                            helperText={!formData.tripName ? 'נדרש שם טיול' : ''}
                        />
                    </Grid>

                    {/* תאריכים */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="תאריך התחלה"
                            type="date"
                            name="startDate"
                            value={formData.startDate || ''}
                            onChange={(e) => handleInputChange('startDate')(e.target.value)}
                            error={startDateError}
                            helperText={startDateError ? 'תאריך התחלה חייב להיות לפני תאריך סיום' : ''}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="תאריך סיום"
                            type="date"
                            name="endDate"
                            value={formData.endDate || ''}
                            onChange={(e) => handleInputChange('endDate')(e.target.value)}
                            error={endDateError}
                            helperText={endDateError ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' : ''}
                            InputLabelProps={{ shrink: true }}
                            disabled={!formData.startDate}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="מספר ימים"
                            type="number"
                            name="numDays"
                            value={formData.numDays || ''}
                            onChange={(e) => handleInputChange('numDays')(e.target.value)}
                            disabled={!formData.startDate || !formData.endDate}
                        />
                    </Grid>
                </Grid>

                {/* מיקומים */}
                {formData.startDate && formData.endDate && (
                    <Box sx={{ mt: 3 }}>
                        <DailyLocationsRenderer
                            numDays={formData.numDays}
                            dailyLocations={formData.dailyLocations}
                            onLocationChange={handleLocationChange}
                            locations={locations}
                            loading={loading}
                            onSearchChange={(event, value) => {
                                setSearchText(value);
                                debouncedSearch(value);
                            }}
                        />
                    </Box>
                )}

                {/* שאר פרטי הטיול */}
                <Box sx={{ mt: 3 }}>
                    <TripDetailsForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        startDateError={startDateError}
                        endDateError={endDateError}
                    />
                </Box>
            </Paper>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BasicInfo;
