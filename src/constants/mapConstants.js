import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Israel bounds and center
export const israelCenter = [31.7683, 35.2137];  // Jerusalem
export const israelBounds = [
    [29.3, 34.2], // Southwest corner
    [33.4, 35.9]  // Northeast corner
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

export const markerIcons = {
    start: createIcon('green'),
    waypoint: createIcon('blue'),
    end: createIcon('red')
};

// Map types configuration
export const MAP_TYPES = {
    hiking: {
        url: 'https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>',
        maxZoom: 16,
        minZoom: 7
    },
    satellite: {
        url: 'https://israelhiking.osm.org.il/OrthophotosTiles/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://israelhiking.osm.org.il">Israel Hiking Map</a>',
        maxZoom: 16,
        minZoom: 7
    }
};
