import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { debounce } from 'lodash';
import { Box, Paper, Snackbar, Alert, Grid, TextField } from '@mui/material';
import { getLocalHikingRoute } from '../../services/LocalOSRMService';
import { locationSearchCache } from '../../services/LocationSearchCache';
import DailyLocationsRenderer from './DailyLocationsRenderer';
import TripDetailsForm from './TripDetailsForm';

const BasicInfo = ({ onSubmit }) => {
    const { tripData, updateBasicDetails } = useTrip();
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
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            return data.map(item => ({
                id: item.place_id,
                name: item.display_name.split(',')[0],
                address: item.display_name,
                coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
            }));
        } catch (error) {
            console.error('Error searching locations:', error);
            setError('שגיאה בחיפוש מיקומים');
            return [];
        }
    }, []);

    // חיפוש מיקומים עם debounce
    const debouncedSearch = useCallback(
        debounce(async (text) => {
            setLoading(true);
            try {
                const cachedResults = locationSearchCache.get(text);
                if (cachedResults) {
                    setLocations(cachedResults);
                } else {
                    const results = await searchLocations(text);
                    locationSearchCache.set(text, results);
                    setLocations(results);
                }
            } catch (error) {
                console.error('Error in debounced search:', error);
                setError('שגיאה בחיפוש מיקומים');
            } finally {
                setLoading(false);
            }
        }, 300),
        [searchLocations]
    );

    // טיפול בשינוי טקסט בחיפוש
    const handleSearchTextChange = useCallback((event, value) => {
        setSearchText(value);
        if (value) {
            debouncedSearch(value);
        } else {
            setLocations([]);
        }
    }, [debouncedSearch]);

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
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <TripDetailsForm
                    formData={formData}
                    onInputChange={handleInputChange}
                    startDateError={startDateError}
                    endDateError={endDateError}
                />
            </Paper>

            {formData.numDays && parseInt(formData.numDays) > 0 && (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <DailyLocationsRenderer
                        numDays={parseInt(formData.numDays)}
                        dailyLocations={formData.dailyLocations}
                        onLocationChange={handleLocationChange}
                        locations={locations}
                        loading={loading}
                        onSearchTextChange={handleSearchTextChange}
                    />
                </Paper>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BasicInfo;
