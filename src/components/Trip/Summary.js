import React, { useRef, useEffect } from 'react';
import { 
    Box, Button, Typography, Paper, Grid,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Divider
} from '@mui/material';
import html2canvas from 'html2canvas';
import { useTrip } from '../../context/TripContext';
import MapComponent from '../TripPlanner/components/map/MapComponent';

const Summary = ({ onFinish, onBack }) => {
    const { tripState } = useTrip();
    const mapRef = useRef(null);

    const captureMap = async () => {
        if (mapRef.current) {
            const canvas = await html2canvas(mapRef.current);
            return canvas.toDataURL('image/png');
        }
        return null;
    };

    const handleFinish = async () => {
        // צילום המפה
        const mapImage = await captureMap();
        
        // עדכון הטיול עם תמונת המפה
        const updatedTrip = {
            ...tripState,
            mapImage,
            status: 'draft',
            lastModified: new Date().toISOString()
        };
        
        onFinish(updatedTrip);
    };

    const formatDate = (date) => {
        if (!date) return 'לא נקבע';
        return new Date(date).toLocaleDateString('he-IL');
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                סיכום הטיול
            </Typography>

            <Grid container spacing={3}>
                {/* פרטים בסיסיים */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            פרטים בסיסיים
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><strong>שם הטיול</strong></TableCell>
                                        <TableCell>{tripState.basicDetails.tripName}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>תאריך התחלה</strong></TableCell>
                                        <TableCell>{formatDate(tripState.basicDetails.startDate)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>תאריך סיום</strong></TableCell>
                                        <TableCell>{formatDate(tripState.basicDetails.endDate)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>שכבת גיל</strong></TableCell>
                                        <TableCell>{tripState.basicDetails.ageGroup}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>ארגון</strong></TableCell>
                                        <TableCell>{tripState.basicDetails.organization}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* מפת המסלול */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            מפת המסלול
                        </Typography>
                        <Box ref={mapRef} sx={{ height: '400px', width: '100%' }}>
                            <MapComponent 
                                readOnly={true}
                                route={tripState.route}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* משתתפים */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            משתתפים ({tripState.participants?.length || 0})
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>שם</TableCell>
                                        <TableCell>כיתה</TableCell>
                                        <TableCell>שם הורה</TableCell>
                                        <TableCell>סטטוס אישור</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tripState.participants?.map((participant) => (
                                        <TableRow key={participant.id}>
                                            <TableCell>{participant.name}</TableCell>
                                            <TableCell>{participant.class}</TableCell>
                                            <TableCell>{participant.parentName}</TableCell>
                                            <TableCell>{participant.approvalStatus}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={onBack}>
                    חזור
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleFinish}
                >
                    סיים תכנון
                </Button>
            </Box>
        </Box>
    );
};

export default Summary;
