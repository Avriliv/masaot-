import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Autocomplete,
  TextField
} from '@mui/material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  ScaleControl,
  Polyline
} from 'react-leaflet';
import {
  Terrain as TerrainIcon,
  Satellite as SatelliteIcon,
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  WbSunny as WeatherIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure';
import axios from 'axios';
import OpenWeatherService from '../../services/OpenWeatherService';
import {
  searchLocations,
  getTevaAlerts
} from '../../services/WeatherService';
import { useNavigate } from 'react-router-dom';
import trailService from '../../services/trailService';

const DEFAULT_CENTER = [31.7767, 35.2345]; // ירושלים
const DEFAULT_ZOOM = 8;

// Custom marker icons
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const waterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const campIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ISRAEL_HIKING_API = 'https://israelhiking.osm.org.il/api/v2';
const SNAP_DISTANCE = 50; // מרחק מקסימלי בין הנקודה שנבחרה לשביל (במטרים)

const MapTypeControl = ({ mapType, onMapTypeChange }) => {
  return (
    <Paper sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: 1 }}>
      <ToggleButtonGroup
        value={mapType}
        exclusive
        onChange={onMapTypeChange}
        aria-label="map type"
      >
        <ToggleButton value="streets" aria-label="streets">
          <MapIcon />
        </ToggleButton>
        <ToggleButton value="satellite" aria-label="satellite">
          <SatelliteIcon />
        </ToggleButton>
        <ToggleButton value="terrain" aria-label="terrain">
          <TerrainIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
};

const MapControls = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    // מדידות
    const measureOptions = {
      position: 'topleft',
      primaryLengthUnit: 'kilometers',
      secondaryLengthUnit: 'meters',
      primaryAreaUnit: 'sqmeters',
      activeColor: '#1a73e8',
      completedColor: '#1557b0',
      popupOptions: {
        className: 'leaflet-measure-resultpopup',
        autoPanPadding: [10, 10]
      },
      localization: 'he',
      captureZIndex: 10000
    };

    const measureControl = new L.Control.Measure(measureOptions);
    measureControl.addTo(map);

    return () => {
      map.removeControl(measureControl);
    };
  }, [map]);

  return null;
};

const LocationButton = () => {
  const map = useMap();
  const [watching, setWatching] = useState(false);
  const [locationMarker, setLocationMarker] = useState(null);
  const [locationCircle, setLocationCircle] = useState(null);

  const handleLocationClick = () => {
    if (!watching) {
      map.locate({
        watch: true,
        enableHighAccuracy: true
      });
      setWatching(true);
    } else {
      map.stopLocate();
      if (locationMarker) {
        map.removeLayer(locationMarker);
        setLocationMarker(null);
      }
      if (locationCircle) {
        map.removeLayer(locationCircle);
        setLocationCircle(null);
      }
      setWatching(false);
    }
  };

  useEffect(() => {
    const onLocationFound = (e) => {
      const radius = e.accuracy;
      
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }
      if (locationCircle) {
        map.removeLayer(locationCircle);
      }
      
      const newMarker = L.marker(e.latlng).addTo(map)
        .bindPopup(`המיקום שלך (דיוק: ${Math.round(radius)} מטרים)`);
      
      const newCircle = L.circle(e.latlng, radius).addTo(map);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 15));
      
      setLocationMarker(newMarker);
      setLocationCircle(newCircle);
    };

    const onLocationError = (e) => {
      console.error(e.message);
      alert('לא הצלחנו לאתר את המיקום שלך. אנא וודא שאישרת גישה למיקום בדפדפן.');
      setWatching(false);
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    return () => {
      map.off('locationfound', onLocationFound);
      map.off('locationerror', onLocationError);
      if (watching) {
        map.stopLocate();
      }
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }
      if (locationCircle) {
        map.removeLayer(locationCircle);
      }
    };
  }, [map, locationMarker, locationCircle, watching]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '20px',
        right: '10px',
        zIndex: 1000,
      }}
    >
      <Tooltip title="הצג את המיקום שלי" placement="left">
        <IconButton
          onClick={handleLocationClick}
          sx={{
            backgroundColor: watching ? '#1a73e8' : 'white',
            color: watching ? 'white' : '#1a73e8',
            '&:hover': {
              backgroundColor: watching ? '#1557b0' : '#f5f5f5'
            }
          }}
        >
          <MyLocationIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const StandaloneMap = ({ isStandalone = false }) => {
  const navigate = useNavigate();
  const [mapType, setMapType] = useState('terrain');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [points, setPoints] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [showWeather, setShowWeather] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [trails, setTrails] = useState([]);
  const [waterPoints, setWaterPoints] = useState([]);
  const [campSites, setCampSites] = useState([]);
  const [error, setError] = useState(null);

  const getWeatherData = async (lat, lon) => {
    try {
      const weather = await OpenWeatherService.getCurrentWeather(lat, lon);
      return {
        temperature: Math.round(weather.main.temp),
        description: weather.weather[0].description,
        icon: weather.weather[0].icon
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const weather = await getWeatherData(position.coords.latitude, position.coords.longitude);
              setWeatherData([weather]);
            },
            () => {
              // אם אין גישה למיקום, נשתמש במיקום ברירת מחדל של ירושלים
              getWeatherData(DEFAULT_CENTER[0], DEFAULT_CENTER[1]).then(weather => {
                setWeatherData([weather]);
              });
            }
          );
        }
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    };
    loadWeather();
  }, []);

  useEffect(() => {
    // טעינת שבילים ונקודות עניין בהתחלה
    if (selectedLocation) {
      const nearbyTrails = trailService.findNearbyTrails(selectedLocation, 5);
      const nearbyWater = trailService.findWaterPoints(selectedLocation, 5);
      const nearbyCamps = trailService.findCampSites(selectedLocation, 5);

      setTrails(nearbyTrails);
      setWaterPoints(nearbyWater);
      setCampSites(nearbyCamps);
    }
  }, [selectedLocation]);

  const handleMapTypeChange = (event, newMapType) => {
    if (newMapType !== null) {
      setMapType(newMapType);
    }
  };

  // פונקציה למציאת הנקודה הקרובה ביותר על שביל מסומן
  const snapToTrail = async (latlng) => {
    try {
      const response = await axios.get(`${ISRAEL_HIKING_API}/routing/snapping`, {
        params: {
          lat: latlng.lat,
          lon: latlng.lng,
          distance: SNAP_DISTANCE
        }
      });
      
      if (response.data && response.data.length > 0) {
        return {
          lat: response.data[0].location.lat,
          lng: response.data[0].location.lng
        };
      }
      return null;
    } catch (error) {
      console.error('Error snapping to trail:', error);
      return null;
    }
  };

  // פונקציה לחישוב מסלול בין נקודות
  const calculateRoute = async (points) => {
    if (points.length < 2) return;
    
    try {
      setLoading(true);
      const coordinates = points.map(p => `${p.lat},${p.lng}`).join('/');
      const response = await axios.get(`${ISRAEL_HIKING_API}/routing/hike/${coordinates}`);
      
      if (response.data) {
        setRoute(response.data.coordinates);
        setRouteStats({
          distance: Math.round(response.data.length * 100) / 100, // עיגול ל-2 ספרות אחרי הנקודה
          ascent: Math.round(response.data.ascent),
          descent: Math.round(response.data.descent),
          time: Math.round(response.data.time)
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('אירעה שגיאה בחישוב המסלול');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // עדכון הטיפול בלחיצה על המפה
  const handleMapClick = async (e) => {
    try {
      const snappedPoint = await snapToTrail(e.latlng);
      
      if (snappedPoint) {
        const newPoints = [...points, snappedPoint];
        setPoints(newPoints);
        await calculateRoute(newPoints);
      } else {
        // הודעה למשתמש בצורה יפה יותר
        setError('נא לבחור נקודה קרובה יותר לשביל מסומן');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error handling map click:', error);
      setError('אירעה שגיאה בעת הוספת הנקודה');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLocationSearch = async (searchText) => {
    if (!searchText) return;
    try {
      const locations = await searchLocations(searchText);
      setSearchResults(locations.map(loc => ({
        ...loc,
        label: loc.displayName || loc.name
      })));
    } catch (error) {
      console.error('Error searching locations:', error);
      setError('שגיאה בחיפוש מיקומים');
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Box sx={{ 
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        display: 'flex',
        gap: 2,
        alignItems: 'center'
      }}>
        <Autocomplete
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => option.label}
          onChange={(event, value) => {
            if (value && value.lat && value.lon) {
              mapInstance.setView([value.lat, value.lon], 15);
            }
          }}
          onInputChange={(event, value) => {
            setSearchQuery(value);
            if (value) {
              handleLocationSearch(value);
            }
          }}
          sx={{ width: 300, backgroundColor: 'white', borderRadius: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="חפש מיקום..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <LocationIcon color="action" sx={{ mr: 1 }} />
                ),
                endAdornment: (
                  searching ? (
                    <CircularProgress size={20} />
                  ) : (
                    params.InputProps.endAdornment
                  )
                )
              }}
            />
          )}
        />
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <HomeIcon />
        </IconButton>
      </Box>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        onClick={handleMapClick}
        whenCreated={setMapInstance}
      >
        <MapControls />
        <LocationButton />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        
        {mapType === 'streets' && (
          <TileLayer
            url="https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>'
          />
        )}
        {mapType === 'satellite' && (
          <TileLayer
            url="https://israelhiking.osm.org.il/Hebrew/mtbTiles/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://israelhiking.osm.org.il">Israel MTB Map</a>'
          />
        )}
        {mapType === 'terrain' && (
          <TileLayer
            url="https://israelhiking.osm.org.il/Hebrew/OverlayTiles/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Overlay</a>'
          />
        )}

        {points.map((point) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={customIcon}
          >
            <Popup>
              <Typography variant="h6">{point.name}</Typography>
              <Typography>{point.description}</Typography>
            </Popup>
          </Marker>
        ))}
        
        {/* הצגת שבילים מסומנים */}
        {trails.map((trail) => (
          <Polyline
            key={trail.id}
            positions={trail.coordinates}
            color={trail.color}
            weight={3}
          >
            <Popup>
              <Typography variant="subtitle1">{trail.name}</Typography>
              <Typography variant="body2">אורך: {trail.length} ק"מ</Typography>
              <Typography variant="body2">דרגת קושי: {trail.difficulty}</Typography>
            </Popup>
          </Polyline>
        ))}

        {/* הצגת נקודות מים */}
        {waterPoints.map((point) => (
          <Marker
            key={point.id}
            position={point.location}
            icon={waterIcon}
          >
            <Popup>
              <Typography variant="subtitle1">{point.name}</Typography>
              <Typography variant="body2">סוג: {point.type}</Typography>
              <Typography variant="body2">
                אמינות: {point.reliable ? 'אמין' : 'לא אמין'}
              </Typography>
              <Typography variant="body2">
                נבדק לאחרונה: {point.lastVerified}
              </Typography>
            </Popup>
          </Marker>
        ))}

        {/* הצגת חניוני לילה */}
        {campSites.map((site) => (
          <Marker
            key={site.id}
            position={site.location}
            icon={campIcon}
          >
            <Popup>
              <Typography variant="subtitle1">{site.name}</Typography>
              <Typography variant="body2">
                מתקנים: {site.facilities.join(', ')}
              </Typography>
              <Typography variant="body2">
                קיבולת: {site.capacity} אנשים
              </Typography>
              {site.requiresPermit && (
                <Typography variant="body2" color="error">
                  דורש אישור מראש
                </Typography>
              )}
            </Popup>
          </Marker>
        ))}

        {/* הצגת המסלול */}
        {route && (
          <Polyline
            positions={route}
            color="#FF4400"
            weight={4}
            opacity={0.8}
            dashArray="10,5"
          />
        )}
      </MapContainer>

      <MapTypeControl mapType={mapType} onMapTypeChange={handleMapTypeChange} />
      
      {showWeather && weatherData.length > 0 && (
        <Card sx={{ position: 'absolute', left: 10, top: 10, zIndex: 1000, maxWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>תחזית מזג אוויר</Typography>
            <List>
              {weatherData.map((forecast, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={forecast.description}
                      secondary={`טמפרטורה: ${forecast.temperature}°C`}
                    />
                  </ListItem>
                  {index < weatherData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Box sx={{ position: 'absolute', left: 10, bottom: 20, zIndex: 1000 }}>
        <IconButton
          onClick={() => setShowWeather(!showWeather)}
          sx={{
            backgroundColor: 'white',
            marginRight: 1,
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <WeatherIcon />
        </IconButton>
        <IconButton
          onClick={() => setShowFavorites(!showFavorites)}
          sx={{
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <FavoriteIcon />
        </IconButton>
      </Box>

      {loading && (
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-20px',
            marginLeft: '-20px',
            zIndex: 1000
          }}
        />
      )}
      
      {/* הצגת נתוני המסלול */}
      {routeStats && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 1,
            zIndex: 1000
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            נתוני המסלול:
          </Typography>
          <Typography variant="body2">
            אורך: {(routeStats.distance / 1000).toFixed(1)} ק"מ
          </Typography>
          <Typography variant="body2">
            עלייה מצטברת: {routeStats.ascent.toFixed(0)} מ'
          </Typography>
          <Typography variant="body2">
            ירידה מצטברת: {routeStats.descent.toFixed(0)} מ'
          </Typography>
          <Typography variant="body2">
            זמן משוער: {Math.round(routeStats.time / 60)} דקות
          </Typography>
        </Box>
      )}
      
      {error && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 1,
            zIndex: 1000,
            color: 'error.main'
          }}
        >
          <Typography variant="body2" gutterBottom>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StandaloneMap;
