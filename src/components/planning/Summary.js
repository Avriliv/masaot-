import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useTrip } from '../../context/TripContext';

const Summary = () => {
    const { tripState } = useTrip();
    const { basicDetails, route } = tripState;

    return (
        <Container maxWidth="md">
            <Typography variant="h5" align="center" gutterBottom>
                סיכום הטיול
            </Typography>
            
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        פרטים בסיסיים
                    </Typography>
                    <Typography>שם הטיול: {basicDetails.tripName}</Typography>
                    <Typography>תיאור: {basicDetails.description}</Typography>
                    <Typography>תאריך התחלה: {basicDetails.startDate}</Typography>
                    <Typography>תאריך סיום: {basicDetails.endDate}</Typography>
                    <Typography>מספר ימים: {basicDetails.numDays}</Typography>
                    <Typography>קבוצת גיל: {basicDetails.ageGroup}</Typography>
                    <Typography>סוג ארגון: {basicDetails.organizationType}</Typography>
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        פרטי המסלול
                    </Typography>
                    {route && route.map((day, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                יום {index + 1}
                            </Typography>
                            <Typography>
                                {day.description}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Container>
    );
};

export default Summary;
