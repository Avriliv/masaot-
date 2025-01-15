import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import TrackingMap from './TrackingMap';
import SOSButton from './SOSButton';
import ActiveTrips from './ActiveTrips';
import AlertsPanel from './AlertsPanel';
import { useTrips } from '../../context/TripsContext';

// הגדרה גלובלית למשתנה timeoutId
let timeoutId;
const LOCATION_UPDATE_INTERVAL = 60000; // עדכון כל דקה

const LiveTrackingView = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sosLocations, setSosLocations] = useState([]);
  const { activeTrips, updateTripLocation } = useTrips();
  const [locationAttempts, setLocationAttempts] = useState(0);
  const [isGettingAccurateLocation, setIsGettingAccurateLocation] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const LOCATION_HISTORY_SIZE = 5; // הגדלנו ל-5 דגימות
  const MOVEMENT_THRESHOLD = 2; // הקטנו ל-2 מטר לשנייה לזיהוי תנועה מדויק יותר
  const MIN_ACCURACY = 10; // דיוק מינימלי רצוי במטרים
  const MAX_ACCURACY = 30; // דיוק מקסימלי מקובל במטרים
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // פונקציה לחישוב מרחק בין שתי נקודות
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // רדיוס כדור הארץ במטרים
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // פונקציה לחישוב ממוצע מיקומים
  const calculateAverageLocation = (locations) => {
    if (!locations.length) return null;
    
    const sum = locations.reduce((acc, loc) => ({
      latitude: acc.latitude + loc.latitude,
      longitude: acc.longitude + loc.longitude,
      accuracy: acc.accuracy + loc.accuracy
    }), { latitude: 0, longitude: 0, accuracy: 0 });

    return {
      latitude: sum.latitude / locations.length,
      longitude: sum.longitude / locations.length,
      accuracy: sum.accuracy / locations.length
    };
  };

  // פונקציה לחישוב ממוצע מיקומים עם משקולות
  const calculateWeightedAverageLocation = (locations) => {
    if (!locations.length) return null;
    
    // מיון המיקומים לפי דיוק (הכי מדויקים קודם)
    const sortedLocations = [...locations].sort((a, b) => a.accuracy - b.accuracy);
    
    // חישוב משקולות - מיקומים מדויקים יותר מקבלים משקל גבוה יותר
    const weights = sortedLocations.map(loc => {
      const accuracyWeight = Math.max(0, 1 - (loc.accuracy / MAX_ACCURACY));
      const timeWeight = 1; // אפשר להוסיף משקל לפי זמן אם רוצים
      return accuracyWeight * timeWeight;
    });
    
    // נרמול המשקולות כך שסכומם יהיה 1
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // חישוב ממוצע משוקלל
    const weightedSum = sortedLocations.reduce((acc, loc, i) => ({
      latitude: acc.latitude + (loc.latitude * normalizedWeights[i]),
      longitude: acc.longitude + (loc.longitude * normalizedWeights[i]),
      accuracy: acc.accuracy + (loc.accuracy * normalizedWeights[i])
    }), { latitude: 0, longitude: 0, accuracy: 0 });

    return {
      latitude: weightedSum.latitude,
      longitude: weightedSum.longitude,
      accuracy: weightedSum.accuracy
    };
  };

  // פונקציה לבדיקה אם המיקום החדש הגיוני
  const isLocationValid = (newLocation, lastLocation) => {
    if (!lastLocation) return true;

    const timeDiff = (newLocation.timestamp - lastLocation.timestamp) / 1000; // הפרש בשניות
    const distance = calculateDistance(
      newLocation.latitude, newLocation.longitude,
      lastLocation.latitude, lastLocation.longitude
    );
    const speed = distance / timeDiff;

    // מהירות מקסימלית סבירה (120 קמ"ש במטרים לשנייה)
    const MAX_REASONABLE_SPEED = 33.33;

    return speed <= MAX_REASONABLE_SPEED;
  };

  // פונקציה לבדיקת איכות המיקום
  const isHighQualityLocation = (location) => {
    return location.accuracy <= MIN_ACCURACY;
  };

  const getAccurateLocation = () => {
    setIsGettingAccurateLocation(true);
    setLocationAttempts(0);
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsGettingAccurateLocation(false);
        reject(new Error('הדפדפן לא תומך באיתור מיקום'));
        return;
      }

      let locationCount = 0;
      const locations = [];
      let bestLocation = null;

      // ניסיון ראשון - מיקום מהיר
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const initialLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          if (!currentLocation || isLocationValid(initialLocation, currentLocation)) {
            setCurrentLocation(initialLocation);
            locations.push(initialLocation);
            if (isHighQualityLocation(initialLocation)) {
              bestLocation = initialLocation;
            }
          }

          const watchId = navigator.geolocation.watchPosition(
            (accuratePosition) => {
              const newLocation = {
                latitude: accuratePosition.coords.latitude,
                longitude: accuratePosition.coords.longitude,
                accuracy: accuratePosition.coords.accuracy,
                timestamp: accuratePosition.timestamp,
              };

              // בדיקת תקינות המיקום החדש
              if (!isLocationValid(newLocation, locations[locations.length - 1])) {
                return;
              }

              locations.push(newLocation);
              locationCount++;

              // עדכון המיקום הטוב ביותר אם נמצא
              if (isHighQualityLocation(newLocation)) {
                bestLocation = newLocation;
              }

              // שמירת רק LOCATION_HISTORY_SIZE המיקומים האחרונים
              if (locations.length > LOCATION_HISTORY_SIZE) {
                locations.shift();
              }

              // חישוב ממוצע משוקלל
              const weightedLocation = calculateWeightedAverageLocation(locations);
              
              // אם מצאנו מיקום מדויק מאוד או אספנו מספיק דגימות
              if (bestLocation || locationCount >= 8) {
                clearTimeout(timeoutId);
                navigator.geolocation.clearWatch(watchId);
                setIsGettingAccurateLocation(false);
                
                // משתמשים במיקום הטוב ביותר אם נמצא, אחרת בממוצע המשוקלל
                resolve({ 
                  coords: bestLocation || weightedLocation,
                  timestamp: Date.now() 
                });
              }
            },
            (error) => {
              console.error('שגיאת מיקום:', error);
              clearTimeout(timeoutId);
              navigator.geolocation.clearWatch(watchId);
              setIsGettingAccurateLocation(false);
              
              if (bestLocation) {
                resolve({ coords: bestLocation, timestamp: Date.now() });
              } else if (locations.length > 0) {
                resolve({ 
                  coords: calculateWeightedAverageLocation(locations),
                  timestamp: Date.now()
                });
              } else if (currentLocation) {
                resolve({ coords: currentLocation, timestamp: Date.now() });
              } else {
                reject(error);
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 3000 // הקטנו ל-3 שניות
            }
          );

          timeoutId = setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            setIsGettingAccurateLocation(false);
            
            if (bestLocation) {
              resolve({ coords: bestLocation, timestamp: Date.now() });
            } else if (locations.length > 0) {
              resolve({ 
                coords: calculateWeightedAverageLocation(locations),
                timestamp: Date.now()
              });
            } else if (currentLocation) {
              resolve({ coords: currentLocation, timestamp: Date.now() });
            } else {
              reject(new Error('לא הצלחנו להשיג מיקום מדויק'));
            }
          }, 8000); // הקטנו ל-8 שניות
        },
        (error) => {
          setIsGettingAccurateLocation(false);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 0
        }
      );
    });
  };

  const updateLocation = async () => {
    try {
      if (!isLoadingLocation) {
        setIsLoadingLocation(true);
      }

      const accuratePosition = await getAccurateLocation();
      if (accuratePosition) {
        const newLocation = {
          latitude: accuratePosition.coords.latitude,
          longitude: accuratePosition.coords.longitude,
          accuracy: accuratePosition.coords.accuracy,
          timestamp: accuratePosition.timestamp,
        };
        setCurrentLocation(newLocation);
        setIsLoadingLocation(false);
        
        // מסיר את הודעת הטעינה
        setAlerts((prev) => prev.filter((alert) => alert.type !== 'info'));
        
        // אם המיקום לא מדויק מספיק, מציג הודעה למשתמש
        if (accuratePosition.coords.accuracy > 50) {
          setAlerts((prev) => [
            ...prev.filter((a) => a.type !== 'warning'),
            {
              id: Date.now(),
              type: 'warning',
              message: 'המיקום שהתקבל אינו מדויק במיוחד. נסה לצאת לאזור פתוח יותר.',
              timestamp: new Date(),
            }
          ]);
        }
        
        // עדכון המיקום בטיול הפעיל אם יש כזה
        if (activeTrips?.length > 0) {
          updateTripLocation(activeTrips[0].id, newLocation);
        }
      }
    } catch (error) {
      console.error('Error getting accurate location:', error);
      setIsLoadingLocation(false);
      
      // מטפל בשגיאות ספציפיות
      let errorMessage = 'אירעה שגיאה בקבלת המיקום';
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'אנא אשר גישה למיקום בדפדפן כדי שנוכל להציג את מיקומך';
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'לא ניתן לקבל את מיקומך כרגע. נסה שוב באזור עם קליטה טובה יותר';
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'תם הזמן המוקצב לקבלת המיקום. מנסה שוב...';
      }
      
      setAlerts((prev) => [
        ...prev.filter((a) => a.type !== 'error'),
        {
          id: Date.now(),
          type: 'error',
          message: errorMessage,
          timestamp: new Date(),
        }
      ]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeLocation = async () => {
      setIsLoadingLocation(true);
      setAlerts((prev) => [
        ...prev.filter((a) => a.type !== 'info'),
        {
          id: Date.now(),
          type: 'info',
          message: 'מאתר את מיקומך...',
          timestamp: new Date(),
        }
      ]);

      try {
        // מנסה לקבל מיקום מיד כשנכנסים לדף
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => reject(error),
            { 
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });

        if (mounted && position) {
          const initialLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setCurrentLocation(initialLocation);
        }
      } catch (error) {
        console.error('שגיאה בקבלת מיקום התחלתי:', error);
      }

      // מתחיל את העדכונים הרגילים
      if (mounted) {
        updateLocation();
      }
    };

    initializeLocation();

    // מעדכן את המיקום כל דקה או כל 30 שניות אם בתנועה
    const interval = setInterval(
      updateLocation,
      isMoving ? LOCATION_UPDATE_INTERVAL / 2 : LOCATION_UPDATE_INTERVAL
    );

    return () => {
      mounted = false;
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isMoving]);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)' }}>
      {/* הוספת אינדיקטור טעינה */}
      {isLoadingLocation && (
        <Box sx={{ 
          position: 'absolute', 
          top: '70px', 
          right: '20px', 
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CircularProgress size={20} />
          <Typography>מאתר את מיקומך...</Typography>
        </Box>
      )}
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', position: 'relative' }}>
            <TrackingMap
              currentLocation={currentLocation}
              activeTrips={activeTrips}
              sosLocations={sosLocations}
            />
            <AlertsPanel
              alerts={alerts}
              onDismiss={(id) =>
                setAlerts((prev) => prev.filter((alert) => alert.id !== id))
              }
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 1000,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                {currentLocation ? (
                  <>
                    דיוק: {Math.round(currentLocation.accuracy)} מטרים
                    <br />
                    עדכון אחרון: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </>
                ) : (
                  'מחפש מיקום...'
                )}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: 3,
              }}
            >
              <SOSButton onSOS={() => {}} currentLocation={currentLocation} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <ActiveTrips trips={activeTrips} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveTrackingView;
