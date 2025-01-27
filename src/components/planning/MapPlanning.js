import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Tabs, 
    Tab
} from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTrip } from '../../context/TripContext';
import { getLocalRoute } from '../../services/LocalOSRMService';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// רישום הקומפוננטות הנדרשות עבור Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// קומפוננטת גרף עליות וירידות
const ElevationChart = ({ route }) => {
    if (!route?.geometry?.coordinates) return null;

    const data = {
        labels: route.geometry.coordinates.map((_, i) => `${(i * 0.1).toFixed(1)} ק"מ`),
        datasets: [
            {
                label: 'גובה (מטרים)',
                data: route.geometry.coordinates.map(coord => coord[2] || 0),
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'גובה (מ׳)',
                    font: {
                        size: 12
                    }
                },
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'מרחק (ק״מ)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    maxTicksLimit: 6,
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    return (
        <Box sx={{ mt: 3, height: 150 }}>
            <Line data={data} options={options} />
        </Box>
    );
};

const MapPlanning = () => {
    const { state } = useTrip();
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [dailyRoutes, setDailyRoutes] = useState([]);
    const [mapLayers, setMapLayers] = useState(null);

    // אתחול המפה
    useEffect(() => {
        if (!mapContainerRef.current || map) return;

        // הגדרת שכבות המפה
        const baseMaps = {
            'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: ' OpenStreetMap contributors'
            }),
            'שבילי טיולים': L.tileLayer('https://israelhiking.osm.org.il/Tiles/{z}/{x}/{y}.png', {
                attribution: ' Israel Hiking'
            }),
            'תצלום אוויר': L.tileLayer('https://israelhiking.osm.org.il/OrthophotosTiles/{z}/{x}/{y}.png', {
                attribution: ' Israel Hiking'
            })
        };

        const overlayMaps = {
            'מפת סימון שבילים': L.tileLayer('https://israelhiking.osm.org.il/OverlayTiles/{z}/{x}/{y}.png', {
                attribution: ' Israel Hiking'
            })
        };

        // יצירת המפה עם שכבת ברירת המחדל
        const newMap = L.map(mapContainerRef.current, {
            center: [31.7683, 35.2137],
            zoom: 8,
            layers: [baseMaps['OpenStreetMap']] // שכבת ברירת מחדל
        });

        // הוספת פקד השכבות
        L.control.layers(baseMaps, overlayMaps, {
            position: 'topleft',
            collapsed: false
        }).addTo(newMap);

        setMap(newMap);
        mapRef.current = newMap;
        setMapLayers({ ...baseMaps, ...overlayMaps });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                setMap(null);
                setMapLayers(null);
            }
        };
    }, []);

    // חישוב מסלולים
    useEffect(() => {
        const calculateRoutes = async () => {
            if (!state.basicDetails?.dailyLocations) return;

            const routes = await Promise.all(
                state.basicDetails.dailyLocations.map(async (day) => {
                    const points = day.locations.filter(loc => loc && loc.coordinates);
                    if (points.length < 2) return null;

                    try {
                        const route = await getLocalRoute(
                            points[0].coordinates,
                            points[points.length - 1].coordinates,
                            points.slice(1, -1).map(p => p.coordinates)
                        );
                        return {
                            ...route,
                            points
                        };
                    } catch (error) {
                        console.error('Error calculating route:', error);
                        return null;
                    }
                })
            );

            setDailyRoutes(routes.filter(Boolean));
        };

        calculateRoutes();
    }, [state.basicDetails?.dailyLocations]);

    // הצגת המסלול הנבחר
    useEffect(() => {
        if (!map || !dailyRoutes.length) return;

        // ניקוי המפה
        map.eachLayer((layer) => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // החזרת שכבת הבסיס אם הוסרה
        if (mapLayers && !map.hasLayer(mapLayers['OpenStreetMap'])) {
            mapLayers['OpenStreetMap'].addTo(map);
        }

        // הצגת המסלול הנבחר
        const route = dailyRoutes[selectedTab];
        if (!route?.geometry) return;

        // הוספת המסלול
        const routeLine = L.polyline(
            route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
            { color: '#0066CC', weight: 5 }
        ).addTo(map);

        // הוספת מרקרים
        route.points.forEach((point, index) => {
            L.marker([point.coordinates[1], point.coordinates[0]])
                .bindPopup(point.name || `נקודה ${index + 1}`)
                .addTo(map);
        });

        // התמקדות במסלול
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    }, [selectedTab, map, dailyRoutes, mapLayers]);

    return (
        <Box sx={{ 
            width: '100%', 
            height: 'calc(100vh - 64px)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* טאבים */}
            <Paper sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}>
                <Tabs 
                    value={selectedTab} 
                    onChange={(_, newValue) => setSelectedTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {state.basicDetails?.dailyLocations?.map((day, index) => (
                        <Tab key={index} label={`יום ${index + 1}`} />
                    ))}
                </Tabs>
            </Paper>

            {/* פאנל מידע */}
            {dailyRoutes[selectedTab] && (
                <Paper sx={{ 
                    p: 2, 
                    position: 'absolute', 
                    top: 60, 
                    right: 10, 
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    width: 350,
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}>
                    <Typography variant="h6" gutterBottom>
                        פרטי המסלול - יום {selectedTab + 1}
                    </Typography>
                    <Typography>
                        מרחק: {(dailyRoutes[selectedTab].distance / 1000).toFixed(1)} ק"מ
                    </Typography>
                    <Typography>
                        זמן משוער: {Math.round(dailyRoutes[selectedTab].duration / 60)} דקות
                    </Typography>
                    <Typography>
                        עלייה מצטברת: {dailyRoutes[selectedTab].ascent || 0} מטרים
                    </Typography>
                    <Typography>
                        ירידה מצטברת: {dailyRoutes[selectedTab].descent || 0} מטרים
                    </Typography>
                    
                    {/* גרף עליות וירידות */}
                    <ElevationChart route={dailyRoutes[selectedTab]} />
                </Paper>
            )}

            {/* מיכל המפה */}
            <Box 
                ref={mapContainerRef} 
                sx={{ 
                    position: 'absolute',
                    top: '48px',
                    left: '10%',
                    right: '10%',
                    bottom: '10%',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    '& .leaflet-container': {
                        height: '100%',
                        width: '100%'
                    }
                }} 
            />
        </Box>
    );
};

export default MapPlanning;
