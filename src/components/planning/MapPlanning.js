import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { Box, Alert, Paper, Typography, CircularProgress, Tabs, Tab, TextField, IconButton, Menu, MenuItem, Button, Autocomplete } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap, LayerGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { decode } from '@mapbox/polyline';
import { MapService, MAP_CONFIG } from '../../services/MapService';
import { LocalOSRMService } from '../../services/LocalOSRMService';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import 'leaflet/dist/leaflet.css';
import { useTrip } from '../../context/TripContext';
import LocationSearchService from '../../services/LocationSearchService';

// Custom icons
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const startMarkerIcon = createIcon('green');
const endMarkerIcon = createIcon('red');
const waypointIcon = createIcon('blue');

// Component to handle map updates
const MapController = ({ bounds }) => {
    const map = useMap();
    
    useEffect(() => {
        // Set default view to Israel's center if no bounds
        if (!bounds) {
            map.setView(MAP_CONFIG.center, MAP_CONFIG.zoom); // Israel's center coordinates
        } else {
            map.fitBounds(bounds);
        }
        
        // Set zoom constraints
        map.setMinZoom(7);
        map.setMaxZoom(16);
    }, [map, bounds]);
    
    return null;
};

// רכיב להצגת פרטי מסלול
const RouteDetails = ({ routes, isFullTrip = false }) => {
  const calculateDayDetails = useCallback((day) => {
    if (!day?.route) {
      return {
        distance: 0,
        duration: 0,
        ascent: 0,
        descent: 0,
        difficulty: 'לא ידוע'
      };
    }
    return {
      distance: day.route.distance || 0,
      duration: day.route.duration || 0,
      ascent: day.route.elevation?.ascent || 0,
      descent: day.route.elevation?.descent || 0,
      difficulty: calculateDifficulty(day.route)
    };
  }, []);

  const calculateDifficulty = (route) => {
    if (!route.elevation) return 'לא ידוע';
    
    const { ascent, descent } = route.elevation;
    const distance = route.distance / 1000; // convert to km
    
    // חישוב רמת הקושי לפי עליות, ירידות ומרחק
    const elevationGain = ascent + descent;
    const elevationPerKm = elevationGain / distance;
    
    if (elevationPerKm > 100) return 'קשה';
    if (elevationPerKm > 50) return 'בינוני';
    return 'קל';
  };

  const calculateTotalDetails = useCallback((routes) => {
    return routes.reduce((total, day) => {
      const details = calculateDayDetails(day);
      return {
        totalDistance: (total.totalDistance || 0) + (details.distance || 0),
        totalDuration: (total.totalDuration || 0) + (details.duration || 0),
        totalAscent: (total.totalAscent || 0) + (details.ascent || 0),
        totalDescent: (total.totalDescent || 0) + (details.descent || 0)
      };
    }, {
      totalDistance: 0,
      totalDuration: 0,
      totalAscent: 0,
      totalDescent: 0
    });
  }, [calculateDayDetails]);

  const totalDetails = isFullTrip ? calculateTotalDetails(routes) : null;

  if (!routes || routes.length === 0) {
    return (
      <Box>
        <Typography>אין מסלולים להצגה</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {isFullTrip ? (
        // תצוגת סיכום מלא
        <Box>
          <Typography variant="h6" gutterBottom>סיכום מסלול מלא</Typography>
          <Typography>מרחק כולל: {(totalDetails.totalDistance / 1000).toFixed(1)} ק"מ</Typography>
          <Typography>זמן הליכה משוער: {Math.round(totalDetails.totalDuration / 60)} דקות</Typography>
          <Typography>עלייה מצטברת: {Math.round(totalDetails.totalAscent)} מטר</Typography>
          <Typography>ירידה מצטברת: {Math.round(totalDetails.totalDescent)} מטר</Typography>
        </Box>
      ) : (
        // תצוגת יום בודד
        routes.map((day, index) => {
          const details = calculateDayDetails(day);
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>פרטי מסלול - יום {index + 1}</Typography>
              <Typography>מרחק: {(details.distance / 1000).toFixed(1)} ק"מ</Typography>
              <Typography>זמן הליכה משוער: {Math.round(details.duration / 60)} דקות</Typography>
              <Typography>עלייה מצטברת: {Math.round(details.ascent)} מטר</Typography>
              <Typography>ירידה מצטברת: {Math.round(details.descent)} מטר</Typography>
              <Typography>רמת קושי: {details.difficulty}</Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
};

// רכיב מרקר עם תמיכה בגרירה ועריכה
const DraggableMarker = ({ position, onPositionChange, dayIndex, pointIndex, pointDetails }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const markerRef = useRef(null);
  const { state, updateBasicDetails } = useTrip();

  const handlePointDetailsUpdate = useCallback(async (dayIndex, pointIndex, details) => {
    try {
      const updatedState = { ...state };
      if (!updatedState.basicDetails) {
        updatedState.basicDetails = {};
      }
      if (!updatedState.basicDetails.dailyLocations) {
        updatedState.basicDetails.dailyLocations = [];
      }
      if (!updatedState.basicDetails.dailyLocations[dayIndex]) {
        updatedState.basicDetails.dailyLocations[dayIndex] = { locations: [] };
      }
      if (!updatedState.basicDetails.dailyLocations[dayIndex].locations) {
        updatedState.basicDetails.dailyLocations[dayIndex].locations = [];
      }

      updatedState.basicDetails.dailyLocations[dayIndex].locations[pointIndex] = {
        ...updatedState.basicDetails.dailyLocations[dayIndex].locations[pointIndex],
        ...details
      };

      await updateBasicDetails(updatedState);
      setError(null);
    } catch (error) {
      console.error('שגיאה בעדכון פרטי הנקודה:', error);
      setError('שגיאה בעדכון פרטי הנקודה. אנא נסה שנית.');
    }
  }, [state, updateBasicDetails]);

  const isOptionEqualToValue = (option, value) => {
    if (!option || !value) return false;
    
    // השוואה לפי id
    if (option.id && value.id) {
      return option.id === value.id;
    }
    
    // השוואה לפי קואורדינטות
    if (option.coordinates && value.coordinates) {
      return option.coordinates[0] === value.coordinates[0] &&
             option.coordinates[1] === value.coordinates[1];
    }
    
    // השוואה לפי שם ומיקום
    return option.name === value.name && 
           option.address === value.address;
  };

  const handleSearch = useCallback(async (searchText) => {
    if (!searchText) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await LocationSearchService.search(searchText);
      setSearchResults(results);
    } catch (error) {
      console.error('שגיאה בחיפוש:', error);
      setError('שגיאה בחיפוש המיקום. אנא נסה שנית.');
    }
  }, []);

  const handleLocationSelect = useCallback(async (location) => {
    if (!location) return;

    try {
      // אם נבחר מיקום מהחיפוש, נשתמש בפרטים שלו
      const locationDetails = {
        name: location.name,
        address: location.address,
        id: location.id,
        type: location.type,
        coordinates: location.coordinates
      };

      // עדכון המיקום במפה
      onPositionChange(location.coordinates);
      
      // עדכון פרטי הנקודה
      handlePointDetailsUpdate(dayIndex, pointIndex, locationDetails);
      
      setSelectedLocation(location);
      setInputValue(location.name);
      setError(null);
    } catch (error) {
      console.error('שגיאה בבחירת מיקום:', error);
      setError('שגיאה בבחירת המיקום. אנא נסה שנית.');
    }
  }, [dayIndex, pointIndex, onPositionChange, handlePointDetailsUpdate]);

  const handleDragEnd = useCallback(async () => {
    const marker = markerRef.current;
    if (!marker) return;

    const newPos = marker.getLatLng();
    try {
      // קבלת פרטי המיקום החדש לפי הקואורדינטות
      const locationDetails = await LocationSearchService.reverseGeocode([newPos.lng, newPos.lat]);
      
      if (locationDetails) {
        handlePointDetailsUpdate(dayIndex, pointIndex, locationDetails);
        setSelectedLocation(locationDetails);
        setInputValue(locationDetails.name);
      }
      
      onPositionChange([newPos.lat, newPos.lng]);
      setError(null);
    } catch (error) {
      console.error('שגיאה בעדכון מיקום:', error);
      setError('שגיאה בעדכון המיקום. אנא נסה שנית.');
    }
  }, [dayIndex, pointIndex, onPositionChange, handlePointDetailsUpdate]);

  useEffect(() => {
    if (pointDetails?.name) {
      const location = {
        name: pointDetails.name,
        coordinates: position,
        address: pointDetails.address || '',
        id: pointDetails.id || Date.now(),
        type: pointDetails.type || 'point'
      };
      setSelectedLocation(location);
      setInputValue(pointDetails.name);
    }
  }, [pointDetails, position]);

  return (
    <Marker
      draggable={true}
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Popup>
        <div style={{ width: '250px' }}>
          <Autocomplete
            value={selectedLocation}
            options={searchResults}
            getOptionLabel={(option) => option?.display_name || ''}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              return option.place_id === value.place_id;
            }}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedLocation(newValue);
                const [lat, lon] = [parseFloat(newValue.lat), parseFloat(newValue.lon)];
                if (!isNaN(lat) && !isNaN(lon)) {
                  onPositionChange([lat, lon]);
                }
              }
            }}
            onInputChange={(event, newValue) => {
              setInputValue(newValue);
              handleSearch(newValue);
            }}
            inputValue={inputValue}
            renderInput={(params) => (
              <TextField
                {...params}
                label="חפש מיקום"
                variant="outlined"
                size="small"
                error={!!error}
                helperText={error}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <div>
                  <Typography variant="subtitle1">{option.display_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {option.address}
                  </Typography>
                </div>
              </li>
            )}
          />
        </div>
      </Popup>
    </Marker>
  );
};

const RouteMarkers = ({ route }) => {
  if (!route?.geometry?.coordinates) return null;

  // יצירת מרקרים לנקודות משמעותיות במסלול
  const points = route.geometry.coordinates.filter((coord, index, coords) => {
    // וידוא שיש קואורדינטות תקינות
    if (!Array.isArray(coord) || coord.length < 2) return false;
    
    if (index === 0 || index === coords.length - 1) return true; // נקודות התחלה וסוף
    
    // נקודות עם שינוי גובה משמעותי (אם יש מידע על גובה)
    if (coord.length > 2) {
      const prevElevation = coords[index - 1][2] || 0;
      const elevation = coord[2] || 0;
      const nextElevation = coords[index + 1][2] || 0;
      
      const elevationChange = Math.abs(elevation - prevElevation) + Math.abs(elevation - nextElevation);
      return elevationChange > 20; // שינוי של יותר מ-20 מטר
    }
    
    return false;
  });

  return points.map((coord, index) => {
    // וידוא שיש קואורדינטות תקינות
    if (!Array.isArray(coord) || coord.length < 2) return null;
    
    const elevation = coord.length > 2 ? coord[2] : null;
    const isEndpoint = index === 0 || index === points.length - 1;
    
    return (
      <Marker
        key={`elevation-${index}`}
        position={[coord[1], coord[0]]}
        icon={isEndpoint ? (index === 0 ? startMarkerIcon : endMarkerIcon) : waypointIcon}
      >
        <Popup>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">
              {isEndpoint ? (index === 0 ? 'נקודת התחלה' : 'נקודת סיום') : 'נקודת ציון'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {coord[1].toFixed(6)}°N, {coord[0].toFixed(6)}°E
            </Typography>
            {elevation !== null && (
              <Typography variant="body2" color="textSecondary">
                גובה: {Math.round(elevation)} מטר
              </Typography>
            )}
          </Box>
        </Popup>
      </Marker>
    );
  }).filter(Boolean);  // סינון ערכים null
};

// רכיב להצגת המסלולים על המפה
const RouteDisplay = ({ routes }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      // מחיקת שכבות קודמות
      map.eachLayer((layer) => {
        if (layer._path) map.removeLayer(layer);
      });

      if (!routes || routes.length === 0) return;

      routes.forEach((route, index) => {
        if (!route?.geometry?.coordinates) return;

        try {
          // יצירת הצל
          const shadow = L.polyline(route.geometry.coordinates, {
            color: '#000',
            opacity: 0.3,
            weight: 8,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map);

          // יצירת הקו העיקרי
          const polyline = L.polyline(route.geometry.coordinates, {
            color: '#2196F3', // כחול מטריאל
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            className: 'route-line' // לאנימציה
          }).addTo(map);

          // הוספת חלון מידע
          if (route.properties) {
            const distanceKm = (route.properties.distance / 1000).toFixed(1);
            const timeHours = (route.properties.time / 3600).toFixed(1);
            
            polyline.bindPopup(`
              <div dir="rtl" style="text-align: right; font-family: system-ui;">
                <div style="font-weight: bold; margin-bottom: 8px;">פרטי המסלול:</div>
                <div>🚶 מרחק: ${distanceKm} ק"מ</div>
                <div>⏱️ זמן משוער: ${timeHours} שעות</div>
              </div>
            `, {
              className: 'route-popup'
            });
          }

          // התאמת התצוגה למסלול הראשון
          if (index === 0) {
            const bounds = polyline.getBounds();
            map.fitBounds(bounds, { 
              padding: [50, 50],
              maxZoom: 16
            });
          }

        } catch (error) {
          console.error(`Error creating route display:`, error);
        }
      });

    }, [map, routes]);

    return null;
  };

const MapPlanning = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dailyRoutes, setDailyRoutes] = useState([]);
  const [calculatedRoutes, setCalculatedRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { state, updateBasicDetails } = useTrip();

  // Default map settings
  const defaultCenter = MAP_CONFIG.center;
  const defaultZoom = MAP_CONFIG.zoom;
  const israelBounds = [
    [MAP_CONFIG.bounds.south, MAP_CONFIG.bounds.west], // Southwest coordinates
    [MAP_CONFIG.bounds.north, MAP_CONFIG.bounds.east]  // Northeast coordinates
  ];

  // אתחול המפה והמסלולים
  useEffect(() => {
    const initializeMap = async () => {
      if (state?.basicDetails?.dailyLocations) {
        setIsLoading(true);
        try {
          console.log('Initializing map with daily locations:', state.basicDetails.dailyLocations);
          await calculateDailyRoutes(state.basicDetails.dailyLocations);
        } catch (error) {
          console.error('Error initializing map:', error);
          setError('אירעה שגיאה באתחול המפה');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeMap();
  }, [state.basicDetails?.dailyLocations]);

  // מעבר בין שלבים
  const handleTabChange = async (event, newValue) => {
    try {
      setError(null);
      
      // בדיקה שיש מספיק נקודות לפני המעבר לשלב 2
      if (newValue === 1) {
        const locations = state.basicDetails?.dailyLocations || [];
        const hasValidLocations = locations.some(day => 
          day?.locations?.length >= 2 && 
          day.locations.every(loc => 
            loc && 
            Array.isArray(loc.coordinates) && 
            loc.coordinates.length === 2
          )
        );

        if (!hasValidLocations) {
          setError('יש להוסיף לפחות שתי נקודות ליום אחד לפני המעבר לשלב הבא');
          return;
        }

        setIsLoading(true);
        try {
          await calculateDailyRoutes(state.basicDetails.dailyLocations);
          setSelectedTab(newValue);
        } catch (error) {
          console.error('Error calculating routes:', error);
          setError('אירעה שגיאה בחישוב המסלולים. אנא נסה שוב.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setSelectedTab(newValue);
      }
    } catch (error) {
      console.error('Error changing tab:', error);
      setError('אירעה שגיאה במעבר בין השלבים. אנא נסה שוב.');
    }
  };

  const handleMarkerDragEnd = useCallback(async (dayIndex, pointIndex, newLatLng) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // עדכון המיקומים היומיים
      const updatedDailyRoutes = [...dailyRoutes];
      const day = updatedDailyRoutes[dayIndex];
      
      if (!day?.locations) {
        day.locations = [];
      }
      
      // עדכון הנקודה החדשה
      const updatedPoint = {
        ...day.locations[pointIndex],
        coordinates: newLatLng
      };
      
      day.locations[pointIndex] = updatedPoint;
      
      // חישוב מסלול חדש
      if (day.locations.length >= 2) {
        try {
          const route = await MapService.calculateHikingRoute(
            [day.locations[0].coordinates[0], day.locations[0].coordinates[1]], // המרה ל-[lon, lat]
            [day.locations[day.locations.length - 1].coordinates[0], day.locations[day.locations.length - 1].coordinates[1]], // המרה ל-[lon, lat]
            day.locations.slice(1, -1).map(loc => [loc.coordinates[0], loc.coordinates[1]]) // המרה ל-[lon, lat]
          );
          day.route = route;
        } catch (error) {
          console.error('שגיאה בחישוב המסלול:', error);
          setError('שגיאה בחישוב המסלול. אנא נסה שנית.');
        }
      }
      
      // עדכון ה-state המקומי
      setDailyRoutes(updatedDailyRoutes);
      
      // עדכון ה-context
      updateBasicDetails({
        ...state,
        basicDetails: {
          ...state.basicDetails,
          dailyLocations: updatedDailyRoutes.map(day => ({
            locations: day.locations,
            route: day.route
          }))
        }
      });
      
    } catch (error) {
      console.error('שגיאה בעדכון המסלול:', error);
      setError('שגיאה בעדכון המסלול. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  }, [dailyRoutes, state, updateBasicDetails]);

  const calculateDayDetails = useCallback((day) => {
    if (!day?.route) {
      return {
        distance: 0,
        duration: 0,
        ascent: 0,
        descent: 0,
        difficulty: 'לא ידוע'
      };
    }
    return MapService.calculateRouteDetails(day.route);
  }, []);

  const calculateTotalDetails = useCallback((routes) => {
    return routes.reduce((total, day) => {
      const details = calculateDayDetails(day);
      return {
        totalDistance: (total.totalDistance || 0) + (details.distance || 0),
        totalDuration: (total.totalDuration || 0) + (details.duration || 0),
        totalAscent: (total.totalAscent || 0) + (details.ascent || 0),
        totalDescent: (total.totalDescent || 0) + (details.descent || 0)
      };
    }, {
      totalDistance: 0,
      totalDuration: 0,
      totalAscent: 0,
      totalDescent: 0
    });
  }, [calculateDayDetails]);

  // חישוב המסלולים
  const calculateDailyRoutes = async (locations) => {
    try {
      if (!locations || locations.length === 0) {
        console.log('No locations provided');
        return;
      }

      console.log('Starting route calculations with locations:', locations);
      setIsLoading(true);
      setError(null);
      setCalculatedRoutes([]); // איפוס המסלולים הקודמים

      const results = [];

      // עיבוד כל יום בנפרד
      for (let dayIndex = 0; dayIndex < locations.length; dayIndex++) {
        const day = locations[dayIndex];
        console.log(`Processing day ${dayIndex}:`, day);

        if (!day || !day.locations || day.locations.length < 2) {
          console.log(`Not enough locations for day ${dayIndex}`);
          continue;
        }

        // סינון נקודות לא תקינות
        const validLocations = day.locations.filter(loc => 
          loc && loc.coordinates && 
          Array.isArray(loc.coordinates) && 
          loc.coordinates.length === 2 &&
          !isNaN(loc.coordinates[0]) && 
          !isNaN(loc.coordinates[1])
        );

        console.log(`Valid locations for day ${dayIndex}:`, validLocations);

        if (validLocations.length < 2) {
          console.log(`Not enough valid locations for day ${dayIndex}`);
          continue;
        }

        // חישוב המסלול בין כל זוג נקודות עוקבות
        for (let i = 0; i < validLocations.length - 1; i++) {
          const start = validLocations[i];
          const end = validLocations[i + 1];
          
          console.log(`Calculating route from ${start.name} to ${end.name}`);
          
          try {
            const route = await MapService.calculateHikingRoute(
              start.coordinates,
              end.coordinates,
              [] // אין נקודות ביניים
            );

            if (route && route.geometry && route.geometry.coordinates) {
              console.log(`Route calculated successfully:`, route);
              results.push(route);
            } else {
              console.warn(`Invalid route data:`, route);
            }
          } catch (error) {
            console.error(`Error calculating route segment:`, error);
            setError(`שגיאה בחישוב המסלול בין ${start.name} ל-${end.name}: ${error.message}`);
          }
        }
      }

      console.log('All routes calculated:', results);
      if (results.length > 0) {
        setCalculatedRoutes(results);
      }

    } catch (error) {
      console.error('Error in calculateDailyRoutes:', error);
      setError('אירעה שגיאה בחישוב המסלולים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = useCallback((dayIndex, locationIndex, newLocation) => {
    const currentLocations = state.basicDetails?.dailyLocations || [];
    const currentLocation = currentLocations[dayIndex]?.locations[locationIndex];

    // בדיקה אם יש שינוי אמיתי במיקום
    if (currentLocation && newLocation && 
        currentLocation.coordinates?.lat === newLocation.coordinates?.lat && 
        currentLocation.coordinates?.lng === newLocation.coordinates?.lng) {
        return;
    }

    const updatedLocations = [...currentLocations];
    if (!updatedLocations[dayIndex]) {
        updatedLocations[dayIndex] = { locations: [] };
    }
    updatedLocations[dayIndex].locations[locationIndex] = newLocation;

    updateBasicDetails({
        ...state.basicDetails,
        dailyLocations: updatedLocations
    });
  }, [state.basicDetails, updateBasicDetails]);

  // הגדרת גבולות ישראל
  const getBoundsFromCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
      return israelBounds;
    }

    try {
      const latLngs = coordinates.map(coord => coord);
      const bounds = L.latLngBounds(latLngs);
      return bounds;
    } catch (error) {
      console.error('Error creating bounds:', error);
      return israelBounds;
    }
  };

  const bounds = useMemo(() => {
    if (!dailyRoutes || dailyRoutes.length === 0) {
      return israelBounds;
    }

    const getRouteBounds = (route) => {
      if (!route) return null;
      
      // כולל גם את נקודות המסלול וגם את הקואורדינטות של המסלול עצמו
      const routeCoords = route.route?.geometry?.coordinates || [];
      const locationCoords = route.locations?.map(loc => loc.coordinates) || [];
      const allCoords = [...routeCoords, ...locationCoords];
      
      return allCoords.length > 0 ? getBoundsFromCoordinates(allCoords).pad(0.2) : null;
    };

    if (selectedTab === dailyRoutes.length) {
      // מסלול מלא - כולל את כל הנקודות
      const allCoordinates = dailyRoutes.flatMap(route => {
        const routeCoords = route.route?.geometry?.coordinates || [];
        const locationCoords = route.locations?.map(loc => loc.coordinates) || [];
        return [...routeCoords, ...locationCoords];
      });
      return allCoordinates.length > 0 ? getBoundsFromCoordinates(allCoordinates).pad(0.2) : israelBounds;
    }

    // מסלול יומי
    const dayBounds = getRouteBounds(dailyRoutes[selectedTab]);
    return dayBounds || israelBounds;
  }, [selectedTab, dailyRoutes]);

  const renderRoutes = useMemo(() => {
    if (!calculatedRoutes || calculatedRoutes.length === 0) return null;

    return calculatedRoutes.map((route, index) => {
      if (!route || !route.geometry) return null;

      // צבעים שונים לכל יום
      const colors = ['#FF4136', '#2ECC40', '#0074D9', '#B10DC9', '#FF851B', '#7FDBFF'];
      const color = colors[index % colors.length];

      // המרת הקואורדינטות לפורמט הנכון
      let positions;
      if (route.geometry.type === 'LineString') {
        positions = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      } else if (Array.isArray(route.geometry)) {
        positions = route.geometry.map(coord => [coord[1], coord[0]]);
      } else {
        console.error('Invalid route geometry:', route.geometry);
        return null;
      }

      return (
        <Polyline
          key={`route-${index}`}
          positions={positions}
          pathOptions={{
            color: color,
            weight: 4,
            opacity: 0.8,
            dashArray: null,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        >
          <Popup>
            <div style={{ direction: 'rtl', textAlign: 'right' }}>
              <strong>יום {index + 1}</strong>
              <br />
              מרחק: {(route.properties.distance / 1000).toFixed(1)} ק"מ
              <br />
              זמן משוער: {Math.round(route.properties.duration / 60)} דקות
              {route.properties.elevation && (
                <>
                  <br />
                  עלייה מצטברת: {route.properties.elevation.ascent} מ'
                  <br />
                  ירידה מצטברת: {route.properties.elevation.descent} מ'
                </>
              )}
            </div>
          </Popup>
        </Polyline>
      );
    });
  }, [calculatedRoutes]);

  const calculateDayRoute = async (dayLocations) => {
    try {
      if (!dayLocations || dayLocations.length < 2) {
        console.log('Not enough locations for route calculation');
        return null;
      }

      // סינון מיקומים לא תקינים
      const validLocations = dayLocations.filter(loc => 
        loc && loc.coordinates && 
        Array.isArray(loc.coordinates) && 
        loc.coordinates.length === 2
      );

      if (validLocations.length < 2) {
        console.log('Not enough valid locations after filtering');
        return null;
      }

      const start = validLocations[0].coordinates;
      const end = validLocations[validLocations.length - 1].coordinates;
      const waypoints = validLocations.slice(1, -1).map(loc => loc.coordinates);

      console.log('Using coordinates:', { start, end, waypoints });
      
      const route = await MapService.calculateHikingRoute(start, end, waypoints);
      return route;
    } catch (error) {
      console.error('Error calculating route for day:', error);
      return null;
    }
  };

  const handleStepChange = async (step) => {
    console.log('Changing to step:', step);
    
    if (step === 2) {
      // בשלב 2, נחשב את המסלולים
      console.log('Step 2 - Calculating routes for:', state.basicDetails.dailyLocations);
      await calculateDailyRoutes(state.basicDetails.dailyLocations);
    }
    
    setSelectedTab(step);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        overflow: 'hidden',
        height: 'calc(100vh - 200px)', // גובה קבוע למפה
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          zIndex: 1
        }
      }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: 2,
              borderRadius: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <MapContainer
          center={[31.7767, 35.2345]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png"
            attribution='מפה: <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>'
            maxZoom={16}
            minZoom={7}
          />
          
          <MapController bounds={null} />
          <RouteDisplay routes={calculatedRoutes} />
          
          {/* הצגת המסלולים והנקודות */}
          {state.basicDetails?.dailyLocations?.map((day, dayIndex) => (
            <React.Fragment key={`day-${dayIndex}`}>
              {/* הצגת הנקודות */}
              {day.locations?.map((location, locationIndex) => {
                if (!location?.coordinates) return null;

                return (
                  <DraggableMarker
                    key={`marker-${dayIndex}-${locationIndex}`}
                    position={location.coordinates}
                    onPositionChange={(newLatLng) => handleMarkerDragEnd(dayIndex, locationIndex, newLatLng)}
                    dayIndex={dayIndex}
                    locationIndex={locationIndex}
                    pointDetails={location}
                    icon={
                      locationIndex === 0
                        ? startMarkerIcon
                        : locationIndex === day.locations.length - 1
                        ? endMarkerIcon
                        : waypointIcon
                    }
                  >
                    <Popup>
                      <div>
                        <strong>{location.name}</strong>
                        <br />
                        {location.address}
                      </div>
                    </Popup>
                  </DraggableMarker>
                );
              })}
            </React.Fragment>
          ))}
        </MapContainer>
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <RouteDetails routes={dailyRoutes} />
      </Box>
    </Box>
  );
};

export default MapPlanning;
