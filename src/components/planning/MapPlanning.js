import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Alert, Paper, Typography, CircularProgress, Tabs, Tab, TextField, IconButton, Menu, MenuItem, Button, Autocomplete } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap, LayerGroup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { decode } from '@mapbox/polyline';
import * as MapService from '../../services/MapService';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import 'leaflet/dist/leaflet.css';
import { useTrip } from '../../context/TripContext';
import LocationSearchService from '../../services/LocationSearchService';
import { getMarkedTrailRoute } from '../../services/LocalOSRMService';

// Custom icons
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <svg width="24" height="36" viewBox="0 0 24 36">
        <path fill="${color}" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
        <circle fill="white" cx="12" cy="12" r="4"/>
      </svg>
    `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

// Define icons
const startMarkerIcon = createIcon('#4CAF50'); // Green
const endMarkerIcon = createIcon('#F44336');   // Red
const waypointIcon = createIcon('#2196F3');    // Blue

// Component to handle map updates
const MapController = ({ bounds }) => {
    const map = useMap();
    
    useEffect(() => {
        // Set default view to Israel's center if no bounds
        if (!bounds) {
            map.setView([31.7683, 35.2137], 8); // Israel's center coordinates
        } else {
            map.fitBounds(bounds);
        }
        
        // Set zoom constraints
        map.setMinZoom(7);
        map.setMaxZoom(16);
    }, [map, bounds]);
    
    return null;
};

// Component to display route details
const RouteDetails = ({ routes }) => {
  const calculateDayDetails = useCallback((route) => {
    if (!route || !route.distance) {
      return {
        distance: 0,
        duration: 0,
        ascent: 0,
        descent: 0,
        difficulty: 'לא ידוע'
      };
    }

    return {
      distance: route.distance || 0,
      duration: route.duration || 0,
      ascent: route.ascent || 0,
      descent: route.descent || 0,
      difficulty: route.difficulty || 'לא ידוע'
    };
  }, []);

  const calculateDayTotalDetails = useCallback((dayRoutes) => {
    if (!dayRoutes || dayRoutes.length === 0) {
      return {
        distance: 0,
        duration: 0,
        ascent: 0,
        descent: 0
      };
    }

    return dayRoutes.reduce((total, route) => {
      const details = calculateDayDetails(route);
      return {
        distance: (total.distance || 0) + (details.distance || 0),
        duration: (total.duration || 0) + (details.duration || 0),
        ascent: (total.ascent || 0) + (details.ascent || 0),
        descent: (total.descent || 0) + (details.descent || 0)
      };
    }, {
      distance: 0,
      duration: 0,
      ascent: 0,
      descent: 0
    });
  }, [calculateDayDetails]);

  const totalDetails = useMemo(() => {
    if (!routes || routes.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        totalAscent: 0,
        totalDescent: 0
      };
    }

    return routes.reduce((total, day) => {
      if (!day || !day.routes) return total;
      
      const dayDetails = calculateDayTotalDetails(day.routes);
      return {
        totalDistance: (total.totalDistance || 0) + (dayDetails.distance || 0),
        totalDuration: (total.totalDuration || 0) + (dayDetails.duration || 0),
        totalAscent: (total.totalAscent || 0) + (dayDetails.ascent || 0),
        totalDescent: (total.totalDescent || 0) + (dayDetails.descent || 0)
      };
    }, {
      totalDistance: 0,
      totalDuration: 0,
      totalAscent: 0,
      totalDescent: 0
    });
  }, [routes, calculateDayTotalDetails]);

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        פרטי המסלול
      </Typography>
      
      {/* Display total summary */}
      <Box sx={{ mb: 2 }}>
        <Typography>
          <strong>סה"כ מרחק:</strong> {(totalDetails.totalDistance / 1000).toFixed(1)} ק"מ
        </Typography>
        <Typography>
          <strong>זמן משוער:</strong> {(totalDetails.totalDuration / 3600).toFixed(1)} שעות
        </Typography>
        <Typography>
          <strong>עלייה מצטברת:</strong> {totalDetails.totalAscent.toFixed(0)} מטר
        </Typography>
        <Typography>
          <strong>ירידה מצטברת:</strong> {totalDetails.totalDescent.toFixed(0)} מטר
        </Typography>
      </Box>

      {/* Display daily route details */}
      {routes.map((day, dayIndex) => {
        if (!day || !day.routes) return null;
        
        const dayDetails = calculateDayTotalDetails(day.routes);
        return (
          <Box key={dayIndex} sx={{ mb: 3 }}>
            <Typography variant="h6">
              יום {dayIndex + 1}
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography>
                מרחק: {(dayDetails.distance / 1000).toFixed(1)} ק"מ
              </Typography>
              <Typography>
                זמן משוער: {(dayDetails.duration / 3600).toFixed(1)} שעות
              </Typography>
              <Typography>
                עלייה: {dayDetails.ascent.toFixed(0)} מטר
              </Typography>
              <Typography>
                ירידה: {dayDetails.descent.toFixed(0)} מטר
              </Typography>
            </Box>

            {/* Display segment details */}
            {day.routes.map((route, segmentIndex) => {
              if (!route) return null;
              
              const details = calculateDayDetails(route);
              return (
                <Box key={segmentIndex} sx={{ ml: 4, mt: 1 }}>
                  <Typography variant="subtitle2">
                    קטע {segmentIndex + 1}: {route.startName} - {route.endName}
                  </Typography>
                  <Typography variant="body2">
                    מרחק: {(details.distance / 1000).toFixed(1)} ק"מ
                  </Typography>
                  <Typography variant="body2">
                    זמן: {(details.duration / 3600).toFixed(1)} שעות
                  </Typography>
                  <Typography variant="body2">
                    רמת קושי: {details.difficulty}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', [lat, lng]);
      onMapClick([lat, lng]);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

// Component for draggable marker
const DraggableMarker = ({ position, icon, onDragEnd, onDelete, name }) => {
  const markerRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          console.log('Marker dragged to:', newPos);
          onDragEnd([newPos.lat, newPos.lng]);
        }
      },
    }),
    [onDragEnd],
  );

  if (!position || !Array.isArray(position) || position.length !== 2) {
    console.warn('Invalid marker position:', position);
    return null;
  }

  return (
    <Marker
      position={position}
      icon={icon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup>
        <Box sx={{ p: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {name || 'נקודת ציון'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {position[0].toFixed(6)}°N, {position[1].toFixed(6)}°E
          </Typography>
          {onDelete && (
            <Button
              size="small"
              color="error"
              onClick={() => onDelete()}
              sx={{ mt: 1 }}
            >
              הסר נקודה
            </Button>
          )}
        </Box>
      </Popup>
    </Marker>
  );
};

// Component to display routes on the map
const RouteDisplay = ({ routes }) => {
  const map = useMap();
  console.log('RouteDisplay: rendering with routes:', routes);

  useEffect(() => {
    console.log('RouteDisplay: effect running with routes:', routes);
    
    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        console.log('Removing layer:', layer);
        map.removeLayer(layer);
      }
    });

    if (!routes || !Array.isArray(routes)) {
      console.warn('No valid routes provided');
      return;
    }

    // Add new routes
    routes.forEach((route, index) => {
      if (!route.geometry?.coordinates) {
        console.warn(`Route ${index} has no coordinates:`, route);
        return;
      }

      console.log(`Adding route ${index}:`, route);

      // Convert coordinates to [lat, lon]
      const coordinates = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      
      // Create polyline
      const polyline = L.polyline(coordinates, {
        color: route.color || `hsl(${(index * 137) % 360}, 70%, 50%)`,
        weight: 3,
        opacity: 0.8
      }).addTo(map);

      // Add popup with route details
      if (route.distance && route.duration) {
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        polyline.bindPopup(`מרחק: ${distance} ק"מ<br>זמן משוער: ${duration} דקות`);
      }
    });

    // Fit map to all routes
    if (routes.length > 0) {
      const bounds = L.latLngBounds(routes.flatMap(route => 
        route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      ));
      console.log('Fitting bounds:', bounds);
      map.fitBounds(bounds);
    }
  }, [routes, map]);

  return null;
};

// Component to display route markers
const RouteMarkers = ({ route }) => {
  const points = useMemo(() => {
    if (!route?.geometry?.coordinates) return [];

    const coords = route.geometry.coordinates;
    if (!coords || coords.length === 0) return [];

    return [
      { coord: coords[0], type: 'start' },
      { coord: coords[coords.length - 1], type: 'end' }
    ];
  }, [route?.geometry?.coordinates]);

  if (!points.length) return null;

  return points.map((point, index) => {
    const { coord, type } = point;
    if (!Array.isArray(coord) || coord.length < 2) return null;
    
    // Convert coordinates from [lon, lat] to [lat, lon]
    const [lon, lat] = coord;
    
    return (
      <Marker
        key={`${type}-${index}`}
        position={[lat, lon]}
        icon={type === 'start' ? startMarkerIcon : endMarkerIcon}
      >
        <Popup>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2">
              {type === 'start' ? 'נקודת התחלה' : 'נקודת סיום'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {lat.toFixed(6)}°N, {lon.toFixed(6)}°E
            </Typography>
          </Box>
        </Popup>
      </Marker>
    );
  });
};

// Main component
const MapPlanning = () => {
  const { state, updateDailyRoutes } = useTrip();
  const [map, setMap] = useState(null);
  const [points, setPoints] = useState([]);
  const [calculatedRoutes, setCalculatedRoutes] = useState([]);
  const [dailyRoutes, setDailyRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('MapPlanning: state received:', state?.basicDetails?.dailyLocations);
  
  // עיבוד הנקודות מהטופס הבסיסי
  useEffect(() => {
    if (state?.basicDetails?.dailyLocations) {
      const allPoints = [];
      
      state.basicDetails.dailyLocations.forEach((day, dayIndex) => {
        console.log(`Processing day ${dayIndex}:`, day);
        
        if (day.locations && Array.isArray(day.locations)) {
          day.locations.forEach((location, locationIndex) => {
            if (location && location.coordinates && Array.isArray(location.coordinates)) {
              const [lon, lat] = location.coordinates;
              
              if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat)) {
                const point = {
                  coordinates: [lat, lon], // פורמט Leaflet [lat, lon]
                  originalCoordinates: [lon, lat], // שמירת הפורמט המקורי [lon, lat] עבור OSRM
                  name: location.name || `נקודה ${locationIndex + 1}`,
                  dayIndex,
                  locationIndex,
                  type: locationIndex === 0 ? 'start' : 
                        locationIndex === day.locations.length - 1 ? 'end' : 'waypoint'
                };
                console.log('Created point:', point);
                allPoints.push(point);
              }
            }
          });
        }
      });

      console.log('Setting points:', allPoints);
      setPoints(allPoints);
    }
  }, [state?.basicDetails?.dailyLocations]);

  // חישוב מסלולים כשיש נקודות
  useEffect(() => {
    const calculateDailyRoutes = async () => {
      if (!points.length) return;

      setIsLoading(true);
      setError(null);

      try {
        // מיון הנקודות לפי ימים
        const pointsByDay = points.reduce((acc, point) => {
          if (!acc[point.dayIndex]) {
            acc[point.dayIndex] = [];
          }
          acc[point.dayIndex].push(point);
          return acc;
        }, {});

        const newDailyRoutes = [];

        // חישוב מסלול לכל יום
        for (const [dayIndex, dayPoints] of Object.entries(pointsByDay)) {
          if (dayPoints.length < 2) continue;

          // מיון הנקודות לפי סדר
          dayPoints.sort((a, b) => a.locationIndex - b.locationIndex);

          try {
            // חישוב המסלול עם נקודות הביניים
            const start = dayPoints[0].originalCoordinates;
            const end = dayPoints[dayPoints.length - 1].originalCoordinates;
            const waypoints = dayPoints.slice(1, -1).map(p => p.originalCoordinates);

            console.log(`Calculating route for day ${dayIndex}:`, {
              start,
              end,
              waypoints
            });

            const route = await getMarkedTrailRoute({
              start,
              end,
              waypoints
            });

            if (route) {
              newDailyRoutes.push({
                dayIndex: parseInt(dayIndex),
                route,
                points: dayPoints
              });
            }
          } catch (error) {
            console.error(`Error calculating route for day ${dayIndex}:`, error);
            setError(`שגיאה בחישוב מסלול ליום ${parseInt(dayIndex) + 1}: ${error.message}`);
          }
        }

        setDailyRoutes(newDailyRoutes);
        
        // עדכון ה-context
        updateDailyRoutes(newDailyRoutes);
      } catch (error) {
        console.error('Error calculating routes:', error);
        setError('שגיאה בחישוב המסלולים: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    calculateDailyRoutes();
  }, [points, updateDailyRoutes]);

  // התמקדות במסלולים כשהם נטענים
  useEffect(() => {
    if (map && points.length > 0) {
      console.log('Focusing on points:', points);
      
      // יצירת גבולות שמכילים את כל הנקודות
      const bounds = points.reduce(
        (bounds, point) => bounds.extend(point.coordinates),
        map.getBounds()
      );

      // התמקדות בגבולות עם ריפוד
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
        animate: true,
        duration: 1
      });
    }
  }, [map, points]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
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
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <MapContainer
          center={[31.7683, 35.2137]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* הצגת המסלולים */}
          {dailyRoutes.map((dailyRoute) => (
            <React.Fragment key={dailyRoute.dayIndex}>
              {/* הצגת הקו של המסלול */}
              <Polyline
                positions={dailyRoute.route.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
                color="#0052CC"
                weight={4}
                opacity={0.8}
              />
              
              {/* הצגת הנקודות */}
              {dailyRoute.points.map((point, index) => (
                <Marker
                  key={`${point.dayIndex}-${point.locationIndex}`}
                  position={point.coordinates}
                  icon={
                    point.type === 'start' ? startMarkerIcon :
                    point.type === 'end' ? endMarkerIcon :
                    waypointIcon
                  }
                >
                  <Popup>
                    <Typography variant="subtitle1">{point.name}</Typography>
                    <Typography variant="body2">
                      יום {point.dayIndex + 1}, נקודה {point.locationIndex + 1}
                    </Typography>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapPlanning;
