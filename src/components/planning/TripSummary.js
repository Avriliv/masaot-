import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Container, 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import CheckIcon from '@mui/icons-material/Check';

const TripSummary = () => {
    const navigate = useNavigate();
    const { tripState, saveTripToMyTrips } = useTrip();
    const [openDialog, setOpenDialog] = useState(false);
    const basicDetails = tripState?.basicDetails || {};
    const route = tripState?.route || [];

    const handleFinishClick = () => {
        setOpenDialog(true);
    };

    const handleConfirm = () => {
        const savedTrip = saveTripToMyTrips(tripState);
        navigate(`/trip/${savedTrip.id}`);
    };

    const handleCancel = () => {
        setOpenDialog(false);
    };

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
                    <Typography>שם הטיול: {basicDetails.tripName || 'לא הוזן'}</Typography>
                    <Typography>תיאור: {basicDetails.description || 'לא הוזן'}</Typography>
                    <Typography>תאריך התחלה: {basicDetails.startDate || 'לא הוזן'}</Typography>
                    <Typography>תאריך סיום: {basicDetails.endDate || 'לא הוזן'}</Typography>
                    <Typography>מספר ימים: {basicDetails.numDays || 'לא הוזן'}</Typography>
                    <Typography>קבוצת גיל: {basicDetails.ageGroup || 'לא הוזן'}</Typography>
                    <Typography>סוג ארגון: {basicDetails.organizationType || 'לא הוזן'}</Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        מיקומי הטיול
                    </Typography>
                    {basicDetails.dailyLocations?.map((location, index) => (
                        <Box key={index}>
                            <Typography>
                                יום {index + 1}:
                            </Typography>
                            <Typography sx={{ ml: 2 }}>
                                התחלה: {location?.start?.label || 'לא נבחר מיקום'}
                            </Typography>
                            <Typography sx={{ ml: 2 }}>
                                סיום: {location?.end?.label || 'לא נבחר מיקום'}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        פרטי המסלול
                    </Typography>
                    {route.length > 0 ? (
                        route.map((day, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    יום {index + 1}
                                </Typography>
                                <Typography>
                                    {day.description || 'אין תיאור למסלול זה'}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography color="text.secondary">
                            טרם נוספו נקודות למסלול
                        </Typography>
                    )}
                </Box>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={handleFinishClick}
                    size="large"
                >
                    סיים תכנון
                </Button>
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCancel}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">
                    האם ברצונך לעבור לדף הטיולים שלי?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        הטיול יישמר ויתווסף לרשימת הטיולים שלך.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        לא
                    </Button>
                    <Button onClick={handleConfirm} color="primary" autoFocus>
                        כן
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TripSummary;
