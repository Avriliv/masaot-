import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import he from 'date-fns/locale/he';

const GeneralPlanningForm = ({ onSave }) => {
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ tripName, startDate, endDate });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    טופס תכנון כללי
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="שם הטיול"
                                value={tripName}
                                onChange={(e) => setTripName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="תאריך התחלה"
                                value={startDate}
                                onChange={setStartDate}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="תאריך סיום"
                                value={endDate}
                                onChange={setEndDate}
                                renderInput={(params) => <TextField {...params} fullWidth required />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                שמור
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};

export default GeneralPlanningForm;
