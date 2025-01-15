import React, { useState, useEffect, useMemo } from 'react';
import { Box, Alert, Paper, Typography, CircularProgress, Tabs, Tab } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import { useTrip } from '../../context/TripContext';
import { getHikingRoute } from '../../services/OSRMService';
import { MapService, MAP_CONFIG } from '../../services/MapService';
import 'leaflet/dist/leaflet.css';

// Custom icons
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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
        if (bounds) {
            map.setMinZoom(7);
            map.setMaxZoom(18);
            map.setMaxBounds(bounds);
            map.fitBounds(bounds);
        }
    }, [map, bounds]);
    
    return null;
};

// רכיב להצגת שבילים מסומנים
const HikingTrails = () => {
    const map = useMap();

    useEffect(() => {
        const hikingLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Trails: &copy; <a href="https://waymarkedtrails.org">waymarkedtrails.org</a>'
        }).addTo(map);

        return () => {
            map.removeLayer(hikingLayer);
        };
    }, [map]);

    return null;
};

// רכיב להצגת פרטי מסלול
const RouteDetails = ({ routes, isFullTrip = false }) => {
    if (!routes || routes.length === 0) return null;

    const totalDetails = isFullTrip ? MapService.calculateTotalTripDetails(routes) : null;

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                width: '250px', 
                ml: 2, 
                p: 2, 
                overflowY: 'auto',
                maxHeight: '500px'
            }}
        >
            <Typography variant="h6" gutterBottom>
                {isFullTrip ? 'פרטי הטיול המלא' : 'פרטי המסלול'}
            </Typography>
            
            {isFullTrip ? (
                <Box>
                    <Typography>
                        סה"כ מרחק: {(totalDetails.totalDistance / 1000).toFixed(1)} ק"מ
                    </Typography>
                    <Typography>
                        סה"כ זמן משוער: {Math.round(totalDetails.totalDuration / 60)} דקות
                    </Typography>
                    <Typography>
                        סה"כ עלייה: {totalDetails.totalAscent}מ'
                    </Typography>
                    <Typography>
                        סה"כ ירידה: {totalDetails.totalDescent}מ'
                    </Typography>
                </Box>
            ) : (
                routes.map((segment, index) => {
                    const details = MapService.calculateDayDetails(segment);
                    return (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {isFullTrip ? `יום ${segment.properties.day}` : 'פרטי היום'}
                            </Typography>
                            <Typography>
                                מרחק: {(details.distance / 1000).toFixed(1)} ק"מ
                            </Typography>
                            <Typography>
                                זמן משוער: {Math.round(details.duration / 60)} דקות
                            </Typography>
                            <Typography>
                                רמת קושי: {details.difficulty}
                            </Typography>
                            {details.elevation.gain > 0 && (
                                <Typography>
                                    עלייה מצטברת: {details.elevation.gain}מ'
                                </Typography>
                            )}
                            {details.elevation.loss > 0 && (
                                <Typography>
                                    ירידה מצטברת: {details.elevation.loss}מ'
                                </Typography>
                            )}
                        </Box>
                    );
                })
            )}
        </Paper>
    );
};

const MapPlanning = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [route, setRoute] = useState(null);
    const [error, setError] = useState(null);
    const [dailyRoutes, setDailyRoutes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [routeProvider, setRouteProvider] = useState(null);
    const { tripData } = useTrip();

    // Israel bounds
    const israelBounds = L.latLngBounds(
        L.latLng(MAP_CONFIG.bounds.south, MAP_CONFIG.bounds.west),
        L.latLng(MAP_CONFIG.bounds.north, MAP_CONFIG.bounds.east)
    );

    const getBoundsFromCoordinates = (coordinates) => {
        if (!coordinates || coordinates.length === 0) {
            return israelBounds;
        }

        try {
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
            const bounds = L.latLngBounds(latLngs);
            return bounds;
        } catch (error) {
            console.error('Error creating bounds:', error);
            return israelBounds;
        }
    };

    // עדכון המסלולים היומיים
    useEffect(() => {
        const dailyLocations = tripData?.basicDetails?.dailyLocations || [];
        const newDailyRoutes = dailyLocations
            .filter(day => day?.route?.geometry)
            .map((day, index) => ({
                ...day.route,
                properties: { ...day.route.properties, day: index + 1 }
            }));
        
        setDailyRoutes(newDailyRoutes);
    }, [tripData?.basicDetails?.dailyLocations]);

    // חישוב הגבולות הנוכחיים
    const bounds = useMemo(() => {
        if (selectedTab === dailyRoutes.length) {
            // מסלול מלא - כולל את כל הנקודות
            const allCoordinates = dailyRoutes.flatMap(route => route.geometry.coordinates);
            return getBoundsFromCoordinates(allCoordinates).pad(0.2);
        } else if (dailyRoutes[selectedTab]) {
            // מסלול יומי
            return getBoundsFromCoordinates(dailyRoutes[selectedTab].geometry.coordinates).pad(0.2);
        }
        return israelBounds;
    }, [selectedTab, dailyRoutes]);

    // טיפול בשינוי טאב
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Box sx={{ height: '500px', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
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

                {routeProvider && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        המסלול חושב באמצעות {routeProvider}
                    </Alert>
                )}

                <Box sx={{ flex: 1, position: 'relative' }}>
                    <MapContainer
                        center={[31.7683, 35.2137]}
                        zoom={8}
                        minZoom={7}
                        maxZoom={15}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        maxBounds={[
                            [29.5, 34.2],
                            [33.3, 35.9]
                        ]}
                    >
                        <MapController bounds={bounds} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <HikingTrails />
                        
                        {selectedTab === dailyRoutes.length ? (
                            // הצגת כל המסלולים
                            dailyRoutes.map((segment, index) => (
                                <LayerGroup key={index}>
                                    <Marker
                                        position={[
                                            segment.geometry.coordinates[0][1],
                                            segment.geometry.coordinates[0][0]
                                        ]}
                                        icon={startMarkerIcon}
                                    >
                                        <Popup>נקודת התחלה - יום {index + 1}</Popup>
                                    </Marker>
                                    <Marker
                                        position={[
                                            segment.geometry.coordinates[segment.geometry.coordinates.length - 1][1],
                                            segment.geometry.coordinates[segment.geometry.coordinates.length - 1][0]
                                        ]}
                                        icon={endMarkerIcon}
                                    >
                                        <Popup>נקודת סיום - יום {index + 1}</Popup>
                                    </Marker>
                                    <Polyline
                                        positions={segment.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                        pathOptions={{
                                            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                                            weight: 4,
                                            opacity: 0.8
                                        }}
                                    >
                                        <Popup>יום {index + 1}</Popup>
                                    </Polyline>
                                </LayerGroup>
                            ))
                        ) : (
                            // הצגת מסלול יומי
                            dailyRoutes[selectedTab] && (
                                <LayerGroup>
                                    <Marker
                                        position={[
                                            dailyRoutes[selectedTab].geometry.coordinates[0][1],
                                            dailyRoutes[selectedTab].geometry.coordinates[0][0]
                                        ]}
                                        icon={startMarkerIcon}
                                    >
                                        <Popup>נקודת התחלה</Popup>
                                    </Marker>
                                    <Marker
                                        position={[
                                            dailyRoutes[selectedTab].geometry.coordinates[dailyRoutes[selectedTab].geometry.coordinates.length - 1][1],
                                            dailyRoutes[selectedTab].geometry.coordinates[dailyRoutes[selectedTab].geometry.coordinates.length - 1][0]
                                        ]}
                                        icon={endMarkerIcon}
                                    >
                                        <Popup>נקודת סיום</Popup>
                                    </Marker>
                                    <Polyline
                                        positions={dailyRoutes[selectedTab].geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                        pathOptions={{
                                            color: '#0000FF',
                                            weight: 4,
                                            opacity: 0.8
                                        }}
                                    />
                                </LayerGroup>
                            )
                        )}
                        <ZoomControl position="topright" />
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
