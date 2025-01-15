import React, { useState, useEffect } from 'react';
import {
    TextField,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';

const TripDetails = ({ data, onUpdate }) => {
    const [details, setDetails] = useState({
        name: '',
        startDate: null,
        endDate: null,
        type: '',
        description: '',
        ...data.details
    });

    useEffect(() => {
        onUpdate({ details });
    }, [details, onUpdate]);

    const handleChange = (field) => (event) => {
        setDetails(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleDateChange = (field) => (date) => {
        setDetails(prev => ({
            ...prev,
            [field]: date
        }));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={heLocale}>
            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                פרטי הטיול
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="שם הטיול"
                                value={details.name}
                                onChange={handleChange('name')}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="תאריך התחלה"
                                value={details.startDate}
                                onChange={handleDateChange('startDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="תאריך סיום"
                                value={details.endDate}
                                onChange={handleDateChange('endDate')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                minDate={details.startDate}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>סוג טיול</InputLabel>
                                <Select
                                    value={details.type}
                                    onChange={handleChange('type')}
                                    label="סוג טיול"
                                >
                                    <MenuItem value="hiking">טיול רגלי</MenuItem>
                                    <MenuItem value="cycling">טיול אופניים</MenuItem>
                                    <MenuItem value="jeep">טיול ג'יפים</MenuItem>
                                    <MenuItem value="mixed">טיול משולב</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="תיאור הטיול"
                                value={details.description}
                                onChange={handleChange('description')}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
};

export default TripDetails;
