import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { 
    Box, 
    Typography, 
    TextField, 
    Paper, 
    List, 
    ListItem,
    ListItemText, 
    IconButton, 
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TerrainIcon from '@mui/icons-material/Terrain';
import SatelliteIcon from '@mui/icons-material/Satellite';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import { styled } from '@mui/material/styles';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Israel bounds and center
const israelCenter = [31.4, 35.0];
const israelBounds = [
    [29.5, 34.2], // Southwest corner
    [33.3, 35.9]  // Northeast corner
];

// Custom icons
const createIcon = (color) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const markerIcons = {
    start: createIcon('green'),
    waypoint: createIcon('blue'),
    end: createIcon('red')
};

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

// Calculate route using OSRM
const calculateHikingRoute = async (points) => {
    if (points.length < 2) return [];
    
    const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
    try {
        const response = await fetch(
            `https://routing.openstreetmap.de/routed-foot/route/v1/hiking/${coordinates}?geometries=geojson&overview=full`
        );
        
        if (!response.ok) throw new Error('Route calculation failed');
        
        const data = await response.json();
        if (data.code !== 'Ok') throw new Error('No route found');
        
        return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error('Error calculating route:', error);
        // Fallback to straight lines if routing fails
        return points.map(p => [p.lat, p.lng]);
    }
};

// Styled components
const MapToolbar = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const SearchBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    flexGrow: 1,
    maxWidth: '300px'
}));

const SearchResults = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: theme.spacing(1),
    maxHeight: '200px',
    overflow: 'auto'
}));

const RouteInfoContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}));

const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e);
        }
    });
    return null;
};

const RoutePlanning = ({ data = {}, onUpdate }) => {
    const [activeBaseMap, setActiveBaseMap] = useState('hiking');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [markers, setMarkers] = useState((data.route && data.route.points) || []);
    const [routePath, setRoutePath] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [editingMarker, setEditingMarker] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
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
        }
    };

    // Rest of the code remains the same
}

export default RoutePlanning;
