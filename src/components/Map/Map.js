import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, GeoJSON, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Box, 
    Typography, 
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Divider,
    Menu,
    MenuItem,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ButtonGroup,
    FormControl,
    InputLabel,
    Select,
    Container,
    AppBar,
    Toolbar,
    Tooltip,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    DirectionsWalk as DirectionsWalkIcon,
    DirectionsBike as DirectionsBikeIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Share as ShareIcon,
    Terrain as TerrainIcon,
    Map as MapIcon,
    Satellite as SatelliteIcon,
    Timer as TimerIcon,
    Directions as DirectionsIcon
} from '@mui/icons-material';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Israel bounds and center
const israelCenter = [31.7683, 35.2137];  // Jerusalem
const israelBounds = [
    [29.5, 34.2],  // Southwest coordinates
    [33.3, 35.9]   // Northeast coordinates
];

// Custom icons
const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const wayPointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Map types configuration
const MAP_TYPES = {
    hiking: {
        name: 'שבילים מסומנים',
        icon: <DirectionsWalkIcon />,
        url: 'https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    bike: {
        name: 'שבילי אופניים',
        icon: <DirectionsBikeIcon />,
        url: 'https://israelhiking.osm.org.il/Hebrew/mtbTiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel MTB Map</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    topo: {
        name: 'טופוגרפי',
        icon: <TerrainIcon />,
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 16,
        minZoom: 7,
        subdomains: ['a', 'b', 'c']
    },
    satellite: {
        name: 'לווין',
        icon: <SatelliteIcon />,
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
        maxZoom: 16,
        minZoom: 7
    }
};

// Styled components
const SearchBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    marginRight: theme.spacing(2)
}));

const SearchResults = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: '100%',
    right: 0,
    left: 0,
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: theme.spacing(1)
}));

const MapToolbar = styled(AppBar)(({ theme }) => ({
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`
}));

const RouteInfoContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(1),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    direction: 'rtl'
}));

// Map Events Component
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e);
        }
    });
    return null;
};

const Map = () => {
    const [activeBaseMap, setActiveBaseMap] = useState('hiking');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [routePath, setRoutePath] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);

    // Search places using Nominatim
    const searchPlaces = async (query) => {
        if (!query.trim()) return;
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(query)}&` +
                `viewbox=34.2674,33.4362,35.8950,29.4533&` +
                `bounded=1&limit=5&countrycodes=IL`
            );
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching places:', error);
            setSearchResults([]);
        }
    };

    // Handle search result selection
    const handleSearchResultClick = (result) => {
        const [lat, lon] = [parseFloat(result.lat), parseFloat(result.lon)];
        const newPoint = {
            lat,
            lng: lon,
            name: result.display_name
        };
        setSelectedPoints([...selectedPoints, newPoint]);
        setSearchQuery('');
        setSearchResults([]);
        if (mapRef.current) {
            mapRef.current.setView([lat, lon], 15);
        }
    };

    // Handle map click
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        
        // Check if the point is within Israel bounds
        if (lat < israelBounds[0][0] || lat > israelBounds[1][0] ||
            lng < israelBounds[0][1] || lng > israelBounds[1][1]) {
            setError('נא לבחור נקודה בתוך גבולות ישראל');
            return;
        }

        const newPoint = {
            lat,
            lng,
            name: `נקודה ${selectedPoints.length + 1}`
        };
        
        setSelectedPoints([...selectedPoints, newPoint]);
    };

    // Update route when points change
    useEffect(() => {
        const updateRoute = async () => {
            if (selectedPoints.length < 2) {
                setRoutePath([]);
                setRouteInfo(null);
                return;
            }

            setLoading(true);
            try {
                let newPath = [];
                let totalDistance = 0;
                let totalElevation = 0;

                for (let i = 1; i < selectedPoints.length; i++) {
                    const start = selectedPoints[i-1];
                    const end = selectedPoints[i];
                    
                    // Get route segment
                    const response = await fetch(
                        `https://routing.openstreetmap.de/routed-foot/route/v1/hiking/` +
                        `${start.lng},${start.lat};${end.lng},${end.lat}` +
                        `?overview=full&geometries=geojson&steps=true`
                    );
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch route');
                    }

                    const data = await response.json();
                    if (data.routes && data.routes[0]) {
                        const route = data.routes[0];
                        newPath = [...newPath, ...route.geometry.coordinates];
                        totalDistance += route.distance;
                        totalElevation += route.elevation_gain || 0;
                    }
                }

                setRoutePath(newPath);
                setRouteInfo({
                    distance: totalDistance / 1000, // Convert to km
                    elevation: totalElevation,
                    estimatedTime: (totalDistance / 1000) / 4 * 60 // Rough estimation: 4 km/h
                });
            } catch (error) {
                console.error('Error updating route:', error);
                setError('שגיאה בחישוב המסלול');
            } finally {
                setLoading(false);
            }
        };

        updateRoute();
    }, [selectedPoints]);

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                        <TextField
                            size="small"
                            placeholder="חיפוש מקום..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchPlaces(e.target.value);
                            }}
                            fullWidth
                            InputProps={{
                                startAdornment: <SearchIcon />
                            }}
                        />
                        {searchResults.length > 0 && (
                            <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                                <List>
                                    {searchResults.map((result) => (
                                        <ListItem
                                            key={result.place_id}
                                            button
                                            onClick={() => handleSearchResultClick(result)}
                                        >
                                            <ListItemText primary={result.display_name} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Grid>
                    <Grid item>
                        <ButtonGroup>
                            {Object.entries(MAP_TYPES).map(([type, config]) => (
                                <Tooltip key={type} title={config.name}>
                                    <IconButton
                                        color={activeBaseMap === type ? 'primary' : 'default'}
                                        onClick={() => setActiveBaseMap(type)}
                                    >
                                        {config.icon}
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </Box>
            
            <Box sx={{ position: 'relative', width: '100%', height: '70vh' }}>
                <MapContainer
                    center={israelCenter}
                    zoom={8}
                    bounds={israelBounds}
                    style={{ width: '100%', height: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer {...MAP_TYPES[activeBaseMap]} />
                    
                    {selectedPoints.map((point, index) => (
                        <Marker
                            key={index}
                            position={[point.lat, point.lng]}
                            icon={index === 0 ? startIcon : 
                                  index === selectedPoints.length - 1 ? endIcon : 
                                  wayPointIcon}
                            draggable
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    const updatedPoints = [...selectedPoints];
                                    updatedPoints[index] = {
                                        ...point,
                                        lat: position.lat,
                                        lng: position.lng
                                    };
                                    setSelectedPoints(updatedPoints);
                                }
                            }}
                        >
                            <Popup>
                                <Typography>{point.name}</Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => {
                                        const newPoints = [...selectedPoints];
                                        newPoints.splice(index, 1);
                                        setSelectedPoints(newPoints);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Popup>
                        </Marker>
                    ))}
                    
                    {routePath.length > 0 && (
                        <Polyline
                            positions={routePath.map(([lng, lat]) => [lat, lng])}
                            color="blue"
                        />
                    )}
                    
                    <MapEvents onMapClick={handleMapClick} />
                </MapContainer>

                {routeInfo && (
                    <Paper 
                        sx={{ 
                            position: 'absolute', 
                            bottom: 16, 
                            right: 16, 
                            left: 16,
                            p: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            direction: 'rtl'
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Typography variant="subtitle2">מרחק</Typography>
                                <Typography>{routeInfo.distance.toFixed(1)} ק"מ</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="subtitle2">זמן משוער</Typography>
                                <Typography>
                                    {Math.floor(routeInfo.estimatedTime / 60)} שעות{' '}
                                    {Math.round(routeInfo.estimatedTime % 60)} דקות
                                </Typography>
                            </Grid>
                            {routeInfo.elevation > 0 && (
                                <Grid item xs={4}>
                                    <Typography variant="subtitle2">טיפוס מצטבר</Typography>
                                    <Typography>{Math.round(routeInfo.elevation)} מטר</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                )}

                {loading && (
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            p: 2,
                            borderRadius: 2
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default Map;
