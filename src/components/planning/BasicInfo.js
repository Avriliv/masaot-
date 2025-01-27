import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { debounce } from 'lodash';
import { Box, TextField, Button, IconButton, Typography, Grid, Autocomplete, CircularProgress, Snackbar, Alert } from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import DeleteIcon from '@mui/icons-material/Delete';
import { locationSearchCache } from '../../services/LocationSearchCache';
import DailyLocationsRenderer from './DailyLocationsRenderer';
import TripDetailsForm from './TripDetailsForm';

const BasicInfo = ({ onSubmit }) => {
    const { state, updateBasicDetails } = useTrip();
    const [formData, setFormData] = useState(() => ({
        tripName: state?.basicDetails?.tripName || '',
        startDate: state?.basicDetails?.startDate || '',
        endDate: state?.basicDetails?.endDate || '',
        dailyLocations: state?.basicDetails?.dailyLocations || [{ locations: [] }] // אתחול עם יום ראשון
    }));

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

    // עדכון ה-context רק כשיש שינוי אמיתי ב-formData
    useEffect(() => {
        const currentStateStr = JSON.stringify(state?.basicDetails);
        const formDataStr = JSON.stringify(formData);
        
        if (currentStateStr !== formDataStr) {
            updateBasicDetails(formData);
        }
    }, [formData, state?.basicDetails, updateBasicDetails]);

    // הוספת יום ראשון אם אין ימים
    useEffect(() => {
        if (!formData.dailyLocations || formData.dailyLocations.length === 0) {
            setFormData(prev => ({
                ...prev,
                dailyLocations: [{ locations: [] }]
            }));
        }
    }, []);

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

    // פונקציה להשוואת אופציות ב-Autocomplete
    const isOptionEqualToValue = useCallback((option, value) => {
        if (!option && !value) return true;
        if (!option || !value) return false;
        // השוואה לפי id
        return option.id === value.id;
    }, []);

    // טיפול בשינוי שדות
    const handleInputChange = useCallback((field) => (value) => {
        setFormData(prevData => {
            // אם אין שינוי בערך, לא לעדכן את ה-state
            if (prevData[field] === value) {
                return prevData;
            }

            const newData = {
                ...prevData,
                [field]: value
            };

            // אם יש תאריך התחלה וסיום, נוודא שיש יום ראשון עם שני מיקומים
            if ((field === 'startDate' || field === 'endDate') && 
                newData.startDate && newData.endDate && 
                (!newData.dailyLocations || newData.dailyLocations.length === 0)) {
                newData.dailyLocations = [{
                    locations: [null, null] // מיקום התחלה וסיום
                }];
            }

            return newData;
        });
    }, []);

    // הוספת יום חדש
    const handleAddDay = useCallback(() => {
        setFormData(prevData => ({
            ...prevData,
            dailyLocations: [...prevData.dailyLocations, { locations: [] }]
        }));
    }, []);

    // הסרת יום
    const handleRemoveDay = useCallback((dayIndex) => {
        setFormData(prevData => ({
            ...prevData,
            dailyLocations: prevData.dailyLocations.filter((_, idx) => idx !== dayIndex)
        }));
    }, []);

    // הוספת מיקום ליום
    const handleAddLocation = useCallback((dayIndex) => {
        setFormData(prevData => {
            const newDailyLocations = [...prevData.dailyLocations];
            if (!newDailyLocations[dayIndex]) {
                newDailyLocations[dayIndex] = { locations: [] };
            }
            if (!Array.isArray(newDailyLocations[dayIndex].locations)) {
                newDailyLocations[dayIndex].locations = [];
            }
            newDailyLocations[dayIndex].locations.push(null);
            return {
                ...prevData,
                dailyLocations: newDailyLocations
            };
        });
    }, []);

    // הסרת מיקום מיום
    const handleRemoveLocation = useCallback((dayIndex, locationIndex) => {
        setFormData(prevData => {
            const newDailyLocations = [...prevData.dailyLocations];
            if (newDailyLocations[dayIndex]?.locations?.length > 1) {
                newDailyLocations[dayIndex].locations = newDailyLocations[dayIndex].locations.filter((_, idx) => idx !== locationIndex);
            }
            return {
                ...prevData,
                dailyLocations: newDailyLocations
            };
        });
    }, []);

    // טיפול בשינוי מיקום
    const handleLocationChange = useCallback((dayIndex, locationIndex, newValue) => {
        console.log('Location change:', { dayIndex, locationIndex, newValue });
        
        setFormData(prevData => {
            const newDailyLocations = [...prevData.dailyLocations];
            
            // וידוא שיש מערך מיקומים ליום הנוכחי
            if (!newDailyLocations[dayIndex]) {
                newDailyLocations[dayIndex] = { locations: [] };
            }
            
            if (!newDailyLocations[dayIndex].locations) {
                newDailyLocations[dayIndex].locations = [];
            }

            // עדכון המיקום
            if (newValue) {
                // המרת הקואורדינטות למערך [lon, lat]
                const coordinates = Array.isArray(newValue.coordinates) 
                    ? newValue.coordinates 
                    : [newValue.coordinates[1], newValue.coordinates[0]];

                newDailyLocations[dayIndex].locations[locationIndex] = {
                    name: newValue.name,
                    address: newValue.address,
                    coordinates: coordinates,
                    id: newValue.id || `temp-${Date.now()}`,
                    type: newValue.type
                };

                console.log('Saved location with coordinates:', coordinates);
            } else {
                newDailyLocations[dayIndex].locations[locationIndex] = null;
            }

            console.log('Updated daily locations:', newDailyLocations);
            
            return {
                ...prevData,
                dailyLocations: newDailyLocations
            };
        });
    }, []);

    // חיפוש מיקומים
    const searchLocations = useCallback(async (searchText) => {
        if (!searchText || searchText.length < 2) {
            setLocations([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                q: searchText,
                format: 'json',
                limit: 10,
                countrycodes: 'il',
                viewbox: '34.2674,33.4356,35.8950,29.4533', // תיחום גיאוגרפי של ישראל
                bounded: 1, // מגביל תוצאות לתוך התיחום
                'accept-language': 'he'
            }).toString();

            const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
                headers: {
                    'Accept-Language': 'he'
                }
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            const data = await response.json();
            
            // המרת התוצאות לפורמט שלנו
            const formattedLocations = data.map(item => ({
                id: item.place_id,
                name: item.display_name.split(',')[0],
                address: item.display_name,
                coordinates: [parseFloat(item.lon), parseFloat(item.lat)], // שמירה כ-[lon, lat]
                type: item.type
            }));

            setLocations(formattedLocations);
        } catch (error) {
            console.error('Error searching locations:', error);
            setError('אירעה שגיאה בחיפוש המיקומים');
            setLocations([]);
        } finally {
            setLoading(false);
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

    // טיפול בשינוי טקסט בשדה החיפוש
    const handleLocationInputChange = useCallback((event, value) => {
        setSearchText(value);
        if (value) {
            searchLocations(value);
        } else {
            setLocations([]);
        }
    }, [searchLocations]);

    // שמירת הטופס
    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('Submitting form data:', formData);
        
        try {
            // וידוא שכל היומיים מכילים מערך מיקומים
            const validatedDailyLocations = formData.dailyLocations.map(day => ({
                locations: Array.isArray(day.locations) ? day.locations : []
            }));

            const basicDetails = {
                ...formData,
                dailyLocations: validatedDailyLocations
            };

            console.log('Saving basic details:', basicDetails);
            updateBasicDetails(basicDetails);
        } catch (error) {
            console.error('Error saving form:', error);
            setError('אירעה שגיאה בשמירת הטופס');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box elevation={2} sx={{ p: 3, mb: 3 }}>
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
                            value={formData.endDate || ''}
                            onChange={(e) => handleInputChange('endDate')(e.target.value)}
                            error={endDateError}
                            helperText={endDateError ? 'תאריך סיום חייב להיות אחרי תאריך התחלה' : ''}
                            InputLabelProps={{ shrink: true }}
                            disabled={!formData.startDate}
                        />
                    </Grid>
                </Grid>

                {/* מיקומים */}
                <Box sx={{ mt: 3 }}>
                    {formData.dailyLocations.map((day, dayIndex) => (
                        <Box key={`day-${dayIndex}`} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    יום {dayIndex + 1}
                                </Typography>
                                {formData.dailyLocations.length > 1 && (
                                    <IconButton
                                        onClick={() => handleRemoveDay(dayIndex)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>
                            
                            {/* מיקומים של היום */}
                            {Array.isArray(day.locations) && day.locations.map((location, locationIndex) => (
                                <Box key={`location-${dayIndex}-${locationIndex}`} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Autocomplete
                                        fullWidth
                                        value={formData.dailyLocations[dayIndex]?.locations[locationIndex] || null}
                                        onChange={(event, newValue) => handleLocationChange(dayIndex, locationIndex, newValue)}
                                        options={locations}
                                        getOptionLabel={(option) => option?.name || ''}
                                        isOptionEqualToValue={(option, value) => 
                                            option?.id === value?.id || 
                                            (option?.coordinates?.[0] === value?.coordinates?.[0] && 
                                             option?.coordinates?.[1] === value?.coordinates?.[1])
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={locationIndex === 0 ? 'נקודת התחלה' : 
                                                       locationIndex === formData.dailyLocations[dayIndex]?.locations.length - 1 ? 'נקודת סיום' :
                                                       `נקודת ביניים ${locationIndex}`}
                                                variant="outlined"
                                                onChange={(e) => {
                                                    searchLocations(e.target.value);
                                                }}
                                                error={!formData.dailyLocations[dayIndex]?.locations[locationIndex]}
                                                helperText={!formData.dailyLocations[dayIndex]?.locations[locationIndex] ? 'נדרש מיקום' : ''}
                                            />
                                        )}
                                        loading={loading}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Typography>{option.name}</Typography>
                                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                    {option.address}
                                                </Typography>
                                            </li>
                                        )}
                                    />
                                    {day.locations.length > 1 && (
                                        <IconButton
                                            onClick={() => handleRemoveLocation(dayIndex, locationIndex)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            
                            {/* כפתור להוספת מיקום */}
                            <Button
                                startIcon={<AddLocationIcon />}
                                onClick={() => handleAddLocation(dayIndex)}
                                sx={{ mt: 1 }}
                            >
                                הוסף מיקום
                            </Button>
                        </Box>
                    ))}

                    {/* כפתור להוספת יום */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddDay}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        הוסף יום חדש
                    </Button>
                </Box>

                {/* שאר פרטי הטיול */}
                <Box sx={{ mt: 3 }}>
                    <TripDetailsForm
                        formData={formData}
                        onInputChange={handleInputChange}
                        startDateError={startDateError}
                        endDateError={endDateError}
                    />
                </Box>
            </Box>

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
