import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import HikingMap from '../Map/HikingMap';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import FlagIcon from '@mui/icons-material/Flag';
import PlaceIcon from '@mui/icons-material/Place';
import StraightIcon from '@mui/icons-material/Straight';

const calculateDistance = (point1, point2) => {
  const lat1 = point1.lat * Math.PI / 180;
  const lng1 = point1.lng * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const lng2 = point2.lng * Math.PI / 180;

  const dlat = lat2 - lat1;
  const dlng = lng2 - lng1;

  const a = Math.sin(dlat / 2) * Math.sin(dlat / 2)
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlng / 2) * Math.sin(dlng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371; // Radius of the Earth in kilometers

  return R * c;
};

// פונקציה לקבלת גובה מקומי (כרגע מחזירה ערך אקראי)
const getElevation = async (point) => {
  try {
    // כרגע נחזיר ערך אקראי בין 0 ל-1000 מטר
    return Math.floor(Math.random() * 1000);
  } catch (error) {
    console.error('Error getting elevation:', error);
    return 0;
  }
};

const TripRouteMap = ({ tripData, onNext, onBack }) => {
  const [routePoints, setRoutePoints] = useState([]);

  const handlePointSelect = (point) => {
    setRoutePoints([...routePoints, point]);
  };

  const handlePointsUpdate = (updatedPoints) => {
    setRoutePoints(updatedPoints);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        תכנון מסלול הטיול
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            סימון נקודות במסלול
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          סמן את נקודות המסלול על המפה. הנקודה הראשונה תהיה נקודת ההתחלה (ירוק) והאחרונה תהיה נקודת הסיום (אדום).
          ניתן לגרור את הנקודות כדי לשנות את מיקומן.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <HikingMap
            selectedPoints={routePoints}
            onPointSelect={handlePointSelect}
            onPointsUpdate={handlePointsUpdate}
          />
          
          {routePoints.length >= 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="primary">
                  פרטי המסלול
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlagIcon sx={{ color: 'success.main' }} />
                  <Typography>
                    נקודת התחלה: {routePoints[0].lat.toFixed(4)}, {routePoints[0].lng.toFixed(4)}
                  </Typography>
                </Box>
                {routePoints.slice(1, -1).map((point, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: 'info.main' }} />
                    <Typography>
                      נקודת ציון {index + 1}: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      {` (מרחק מהנקודה הקודמת: ${calculateDistance(routePoints[index], point).toFixed(2)} ק"מ)`}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlaceIcon sx={{ color: 'error.main' }} />
                  <Typography>
                    נקודת סיום: {routePoints[routePoints.length - 1].lat.toFixed(4)}, {routePoints[routePoints.length - 1].lng.toFixed(4)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StraightIcon />
                    אורך המסלול הכולל: {routePoints.reduce((total, point, i) => {
                      if (i === 0) return total;
                      return total + calculateDistance(routePoints[i-1], point);
                    }, 0).toFixed(2)} ק"מ
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowForward />}
          onClick={onBack}
        >
          חזור
        </Button>
        
        <Button
          variant="contained"
          endIcon={<ArrowBack />}
          onClick={() => {
            if (routePoints.length >= 2) {
              onNext({ routePoints });
            }
          }}
          disabled={routePoints.length < 2}
        >
          המשך
        </Button>
      </Box>
    </Box>
  );
};

export default TripRouteMap;
