import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Paper, Grid, Typography, IconButton, Tooltip, Alert, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import {
    LayersOutlined as LayersIcon,
    TerrainOutlined as TerrainIcon,
    EditLocationAlt as EditIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import { useTrip } from '../../../../../context/TripContext';
import MapControls from './components/MapControls';
import TrailInfo from './components/TrailInfo';
import ElevationChart from './components/ElevationChart';
import MapFocus from './components/MapFocus';
import {
    getMarkedTrails, calculateRoute, calculateRouteOnTrails, getElevationData
} from './utils/trailUtils';
import {
    formatCoordinates
} from './utils/coordinateUtils';
import {
    startIcon,
    middleIcon,
    endIcon,
    createCustomIcon
} from './utils/mapIcons';

// ישראל במרכז המפה
const DEFAULT_CENTER = [31.7683, 35.2137];
const DEFAULT_ZOOM = 8;

// שכבות מפה זמינות
const MAP_LAYERS = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        name: 'OpenStreetMap'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri',
        name: 'תצלום לוויין'
    },
    topo: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap',
        name: 'מפה טופוגרפית'
    },
    hiking: {
        url: 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
        attribution: '© Waymarked Trails',
        name: 'שבילי הליכה'
    },
    basic: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        name: 'OpenStreetMap'
    }
};

const TrailMap = () => {
    const { tripState } = useTrip();
    const { route } = tripState || {};
    console.log('Route from context:', route);

    const [selectedLayer, setSelectedLayer] = useState('osm');
    const [showHikingLayer, setShowHikingLayer] = useState(true);
    const [trails, setTrails] = useState([]);
    const [routePoints, setRoutePoints] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [elevationData, setElevationData] = useState(null);
    const [pointNames, setPointNames] = useState({});
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    const mapRef = useRef(null);
    const routeLayerRef = useRef(null);

    useEffect(() => {
        if (route?.startPoint?.coordinates && route?.endPoint?.coordinates) {
            console.group('🗺️ Updating Map Route');
            console.log('Route points:', { 
                start: route.startPoint, 
                end: route.endPoint 
            });
            
            updateRoute([route.startPoint, route.endPoint]);
        }
    }, [route?.startPoint, route?.endPoint]);

    useEffect(() => {
        if (route.startPoint && route.endPoint) {
            // Call the function to calculate the route based on the selected points
            calculateAndDisplayRoute(route.startPoint, route.endPoint);
        }
    }, [route.startPoint, route.endPoint]);

    const calculateAndDisplayRoute = async (startPoint, endPoint) => {
        console.log('Start Point:', startPoint);
        console.log('End Point:', endPoint);
        // Logic to calculate the route using Overpass API
        const routeData = await calculateRouteOnTrails(startPoint, endPoint);
        // Display the route on the map
        displayRouteOnMap(routeData);
    };

    const updateRoute = async (points) => {
        console.group('🗺️ Updating Route');
        console.log('Selected points:', points);

        try {
            if (!points || points.length < 2) {
                console.log('Not enough points selected');
                return;
            }

            setStatus('loading');
            setError(null);

            // קבלת השבילים המסומנים באזור
            const bounds = getBoundsFromPoints(points.map(p => p.coordinates));
            console.log('Fetching trails within bounds:', bounds);
            
            const trails = await getMarkedTrails(bounds);
            console.log('Found marked trails:', trails);

            if (!trails || trails.length === 0) {
                throw new Error('לא נמצאו שבילים מסומנים באזור המבוקש');
            }

            // חישוב מסלול על השבילים המסומנים
            const routeResult = await calculateRouteOnTrails(points[0], points[points.length - 1], trails);
            console.log('Route calculated:', routeResult);

            if (!routeResult?.route) {
                throw new Error('לא הצלחנו למצוא מסלול מתאים בשבילים המסומנים');
            }

            // הצגת המסלול על המפה
            if (mapRef.current) {
                // מחיקת השכבה הקיימת אם יש
                if (routeLayerRef.current) {
                    routeLayerRef.current.remove();
                }

                // יצירת שכבה חדשה עם המסלול
                routeLayerRef.current = L.geoJSON(routeResult.route, {
                    style: {
                        color: '#FF4081',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10',
                        lineCap: 'round'
                    }
                }).addTo(mapRef.current);

                // הוספת סמנים לנקודות ההתחלה והסיום
                const startMarker = L.marker(points[0].coordinates, { icon: startIcon }).addTo(mapRef.current);
                const endMarker = L.marker(points[points.length - 1].coordinates, { icon: endIcon }).addTo(mapRef.current);

                // התאמת התצוגה למסלול
                const bounds = routeLayerRef.current.getBounds();
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });

                // שמירת נתוני המסלול
                setRoutePoints(routeResult.route);
                
                // קבלת נתוני גובה
                const elevationResult = await getElevationData(routeResult.route.geometry.coordinates);
                setElevationData(elevationResult);
            }

            setStatus('success');
            console.log('Route updated successfully');

        } catch (error) {
            console.error('Error updating route:', error);
            setStatus('error');
            setError(error.message);
        } finally {
            console.groupEnd();
        }
    };

    const displayRouteOnMap = (routeData) => {
        // Display the route on the map
        if (mapRef.current) {
            // Clear existing route layer if any
            if (routeLayerRef.current) {
                routeLayerRef.current.remove();
            }

            // Create a new layer with the route
            routeLayerRef.current = L.geoJSON(routeData, {
                style: {
                    color: '#FF4081',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 10',
                    lineCap: 'round'
                }
            }).addTo(mapRef.current);

            // Add markers to the start and end points
            const startMarker = L.marker(routeData[0].coordinates, { icon: startIcon }).addTo(mapRef.current);
            const endMarker = L.marker(routeData[routeData.length - 1].coordinates, { icon: endIcon }).addTo(mapRef.current);

            // Fit the map view to the route
            const bounds = routeLayerRef.current.getBounds();
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    const handlePointNameChange = (pointId, newName) => {
        setPointNames(prev => ({
            ...prev,
            [pointId]: newName
        }));
    };

    const handlePointClick = (point) => {
        setSelectedPoint({
            ...point,
            name: pointNames[point.value] || point.label,
            coordinates: formatCoordinates(point.coordinates)
        });
    };

    const renderMarkers = () => {
        const markers = [];
        
        if (route?.startPoint?.coordinates) {
            const [lat, lng] = route.startPoint.coordinates;
            markers.push(
                <Marker 
                    key="start"
                    position={[lat, lng]}
                    icon={L.divIcon({
                        className: 'custom-marker start-marker',
                        html: '🏁',
                        iconSize: [25, 25]
                    })}
                >
                    <Popup>{route.startPoint.name}</Popup>
                </Marker>
            );
        }
        
        if (route?.endPoint?.coordinates) {
            const [lat, lng] = route.endPoint.coordinates;
            markers.push(
                <Marker 
                    key="end"
                    position={[lat, lng]}
                    icon={L.divIcon({
                        className: 'custom-marker end-marker',
                        html: '🏁',
                        iconSize: [25, 25]
                    })}
                >
                    <Popup>{route.endPoint.name}</Popup>
                </Marker>
            );
        }
        
        return markers;
    };

    const renderStatus = () => {
        switch (status) {
            case 'LOADING':
                return (
                    <Alert severity="info" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                        מחשב מסלול...
                    </Alert>
                );
            case 'ERROR':
                return (
                    <Alert severity="error" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                        {error || 'שגיאה בחישוב המסלול'}
                    </Alert>
                );
            default:
                return null;
        }
    };

    return (
        <Grid container spacing={2}>
            {renderStatus()}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ height: '70vh', position: 'relative' }}>
                    <MapContainer
                        center={DEFAULT_CENTER}
                        zoom={DEFAULT_ZOOM}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer {...MAP_LAYERS.basic} />
                        
                        {showHikingLayer && (
                            <TileLayer {...MAP_LAYERS.hiking} />
                        )}

                        {routePoints && routePoints.length > 0 && (
                            <>
                                <Polyline
                                    positions={routePoints}
                                    pathOptions={{
                                        color: 'white',
                                        weight: 6,
                                        opacity: 0.3,
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }}
                                />
                                <Polyline
                                    positions={routePoints}
                                    pathOptions={{
                                        color: 'blue',
                                        weight: 4,
                                        opacity: 0.8,
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }}
                                />
                            </>
                        )}

                        {renderMarkers()}

                    </MapContainer>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                    <TrailInfo
                        route={route}
                        elevationData={elevationData}
                    />
                    <ElevationChart
                        data={elevationData}
                        onHover={(point) => {/* הדגשת נקודה במפה */}}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default TrailMap;
