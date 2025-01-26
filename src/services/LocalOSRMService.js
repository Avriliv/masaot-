import { decode } from '@mapbox/polyline';

const ISRAEL_HIKING_API_BASE = 'https://israelhiking.osm.org.il/api/v2'; // updated API version
const OSRM_API_BASE = 'https://routing.openstreetmap.de/routed-foot';

// בדיקת זמינות השרת המקומי
export const checkLocalServerAvailability = async () => {
    try {
        const response = await fetch(`${ISRAEL_HIKING_API_BASE}/routing/iht/35.2137,31.7683/35.2137,31.7683`);
        const data = await response.json();
        
        if (!response.ok || !data.features) {
            throw new Error('Israel Hiking API server is not responding correctly');
        }
        
        console.log('Israel Hiking API server is available');
        return true;
    } catch (error) {
        console.warn('Israel Hiking API server is not available:', error);
        return false;
    }
};

// פונקציה לנירמול קואורדינטות
const normalizeCoordinates = (coords) => {
    if (!coords) return null;
    
    // אם זה מערך
    if (Array.isArray(coords)) {
        if (coords.length !== 2) return null;
        return coords;
    }
    
    // אם זה אובייקט עם lat/lng
    if (coords.lat !== undefined && coords.lng !== undefined) {
        return [coords.lng, coords.lat];
    }
    
    // אם זה אובייקט עם lat/lon
    if (coords.lat !== undefined && coords.lon !== undefined) {
        return [coords.lon, coords.lat];
    }
    
    return null;
};

// פונקציה לבדיקת תקינות קואורדינטות
const isValidCoordinates = (coords) => {
    const normalized = normalizeCoordinates(coords);
    if (!normalized) return false;
    
    const [lon, lat] = normalized;
    return !isNaN(lon) && !isNaN(lat) &&
           lon >= -180 && lon <= 180 &&
           lat >= -90 && lat <= 90;
};

// פונקציה לבדיקה אם נקודה בתוך ישראל
const isPointInIsrael = (coords) => {
    const normalized = normalizeCoordinates(coords);
    if (!normalized) return false;
    
    const [lon, lat] = normalized;
    return lat >= 29.5 && lat <= 33.3 && // גבולות הרוחב של ישראל
           lon >= 34.2 && lon <= 35.9;    // גבולות האורך של ישראל
};

// פונקציה להמרת קואורדינטות למחרוזת עבור Israel Hiking API
const formatCoordinatesForAPI = (coords) => {
    if (!coords) return null;
    
    let lat, lon;
    
    // אם זה מערך [lon, lat]
    if (Array.isArray(coords)) {
        [lon, lat] = coords;
    }
    // אם זה אובייקט עם lat/lng
    else if (coords.lat !== undefined && coords.lng !== undefined) {
        lat = coords.lat;
        lon = coords.lng;
    }
    // אם זה אובייקט עם lat/lon
    else if (coords.lat !== undefined && coords.lon !== undefined) {
        lat = coords.lat;
        lon = coords.lon;
    }
    else {
        return null;
    }
    
    return `${lat},${lon}`;
};

// שירות לחישוב מסלולים
export const getMarkedTrailRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        console.log('Input coordinates:', { startCoords, endCoords, waypoints });

        // המרת הקואורדינטות לפורמט הנכון [lat, lon] -> [lon, lat]
        const formatCoords = ([lat, lon]) => `${lon},${lat}`;
        
        // בניית מערך של כל הנקודות
        const coordinates = [
            formatCoords(startCoords),
            ...waypoints.map(formatCoords),
            formatCoords(endCoords)
        ].join(';');

        // בניית ה-URL
        const url = `${OSRM_API_BASE}/route/v1/foot/${coordinates}?steps=true&geometries=geojson&overview=full`;

        console.log('Requesting OSRM route:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`Failed to get route: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (!data.routes || !data.routes.length) {
            throw new Error('No routes found in response');
        }

        const route = data.routes[0];
        
        // המרת הנקודות לפורמט הנכון
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
            },
            properties: {
                distance: route.distance || 0, // במטרים
                time: route.duration || 0 // בשניות
            }
        };

    } catch (error) {
        console.error('Error in getMarkedTrailRoute:', error);
        throw error;
    }
};

// הפונקציה הראשית לחישוב מסלול
export const getLocalRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        return await getMarkedTrailRoute(startCoords, endCoords, waypoints);
    } catch (error) {
        console.error('Error in getLocalRoute:', error);
        throw error;
    }
};
