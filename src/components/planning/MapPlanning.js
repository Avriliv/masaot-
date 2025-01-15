import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { Box, Alert, Paper, Typography, CircularProgress, Tabs, Tab, TextField, IconButton, Menu, MenuItem, Button, Autocomplete } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap, LayerGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
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
            onChange={(event, newValue) => handleLocationSelect(newValue)}
            onInputChange={(event, newValue) => {
              setInputValue(newValue);
              handleSearch(newValue);
            }}
            inputValue={inputValue}
            options={searchResults}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={isOptionEqualToValue}
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
                  <Typography variant="subtitle1">{option.name}</Typography>
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
            <Typography variant="body2" color="text.secondary">
              {coord[1].toFixed(6)}°N, {coord[0].toFixed(6)}°E
            </Typography>
            {elevation !== null && (
              <Typography variant="body2" color="text.secondary">
                גובה: {Math.round(elevation)} מטר
              </Typography>
            )}
          </Box>
        </Popup>
      </Marker>
    );
  }).filter(Boolean);  // סינון ערכים null
};

const MapPlanning = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dailyRoutes, setDailyRoutes] = useState([]);
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

  console.log('Updating daily routes from state:', state?.basicDetails?.dailyLocations);
  useEffect(() => {
    if (state?.basicDetails?.dailyLocations) {
      const routes = state.basicDetails.dailyLocations.map(day => ({
        locations: Array.isArray(day.locations) ? day.locations : [],
        route: day.route || null
      }));
      setDailyRoutes(routes);
    } else {
      setDailyRoutes([]);
    }
  }, [state?.basicDetails?.dailyLocations]);

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
            day.locations[0].coordinates,
            day.locations[day.locations.length - 1].coordinates,
            day.locations.slice(1, -1).map(loc => loc.coordinates)
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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 200px)', 
      width: '100%', 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column',
      margin: '16px 0'
    }}>
      {dailyRoutes.length > 0 && (
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {dailyRoutes.map((_, index) => (
            <Tab key={index} label={`יום ${index + 1}`} />
          ))}
          <Tab label="מסלול מלא" />
        </Tabs>
      )}

      <Box sx={{ flex: 1, display: 'flex' }}>
        {isLoading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            textAlign: 'center',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 3
          }}>
            <CircularProgress />
            <Typography sx={{ mt: 1 }}>
              מחשב מסלול...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapContainer
            key={dailyRoutes.length > 0 ? 'with-routes' : 'empty'}
            center={defaultCenter}
            zoom={defaultZoom}
            minZoom={7}
            maxZoom={16}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', backgroundColor: '#f8f9fa' }}
            maxBounds={israelBounds}
          >
            <LayersControl position="topright">
              {/* Base Layer */}
              <LayersControl.BaseLayer name="מפת טיולים" checked={true}>
                <TileLayer
                  url={MAP_CONFIG.layers.base.hiking.url}
                  attribution={MAP_CONFIG.layers.base.hiking.attribution}
                />
              </LayersControl.BaseLayer>
              
              {/* OpenStreetMap Layer */}
              <LayersControl.BaseLayer name="OpenStreetMap">
                <TileLayer
                  url={MAP_CONFIG.layers.base.osm.url}
                  attribution={MAP_CONFIG.layers.base.osm.attribution}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <ZoomControl position="bottomright" />
            <MapController bounds={bounds} />
            
            {selectedTab < dailyRoutes.length && dailyRoutes[selectedTab] && (
              <>
                {/* הצגת המסלול */}
                {dailyRoutes[selectedTab]?.route?.geometry?.coordinates?.length > 0 && (
                  <Polyline
                    positions={dailyRoutes[selectedTab].route.geometry.coordinates.map(coord => 
                      Array.isArray(coord) && coord.length >= 2 ? [coord[1], coord[0]] : null
                    ).filter(Boolean)}
                    pathOptions={{
                      color: '#FF4400',
                      weight: 4,
                      opacity: 0.8,
                      dashArray: '10, 10',
                      lineCap: 'round'
                    }}
                  />
                )}

                {/* הצגת נקודות המסלול */}
                {Array.isArray(dailyRoutes[selectedTab]?.locations) && dailyRoutes[selectedTab].locations.map((location, index) => (
                  location?.coordinates?.length >= 2 && (
                    <DraggableMarker
                      key={`location-${index}`}
                      position={location.coordinates}
                      onPositionChange={(pos) => handleMarkerDragEnd(selectedTab, index, pos)}
                      dayIndex={selectedTab}
                      pointIndex={index}
                      pointDetails={location}
                    />
                  )
                ))}

                {/* הצגת נקודות משמעותיות במסלול */}
                {dailyRoutes[selectedTab]?.route && (
                  <RouteMarkers route={dailyRoutes[selectedTab].route} />
                )}
              </>
            )}
          </MapContainer>
        </Box>

        {dailyRoutes.length > 0 && (
          selectedTab === dailyRoutes.length ? (
            <RouteDetails routes={dailyRoutes} isFullTrip={true} />
          ) : (
            <RouteDetails routes={[dailyRoutes[selectedTab]]} isFullTrip={false} />
          )
        )}
      </Box>
    </Box>
  );
};

export default MapPlanning;
