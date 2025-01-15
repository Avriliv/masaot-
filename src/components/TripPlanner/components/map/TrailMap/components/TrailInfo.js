import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import {
    calculateDistance,
    calculateElevationStats
} from '../utils/trailUtils'; 
import {
    startIcon,
    middleIcon,
    endIcon
} from '../utils/mapIcons'; 

const TrailInfo = ({ dailyLocations, route, elevationData, trails, trailInfo }) => {
    // Check if route and dailyLocations are available
    if (!route || !dailyLocations) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography>אין נתוני מסלול זמינים</Typography>
            </Paper>
        );
    }

    // Calculate statistics
    const totalDistance = calculateDistance(route);
    const { totalAscent, totalDescent } = calculateElevationStats(elevationData);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6">פרטי המסלול</Typography>
            <Typography>אורך המסלול: {totalDistance} ק"מ</Typography>
            <Typography>עלייה כוללת: {totalAscent} מ</Typography>
            <Typography>ירידה כוללת: {totalDescent} מ</Typography>
            {/* Display trail information */}
            {trailInfo && trailInfo.length > 0 && (
                <Box>
                    <Typography variant="subtitle1">שבילים מסומנים במסלול</Typography>
                    {trailInfo.map((trail) => (
                        <Chip key={trail.id} label={trail.type} icon={startIcon} />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default TrailInfo;