import { getRoute as getPublicRoute, getHikingRoute as getPublicHikingRoute } from './OSRMService';
import { decode } from '@mapbox/polyline';

const LOCAL_OSRM_BASE_URL = 'http://localhost:5000';
const ISRAEL_HIKING_OSRM_URL = 'https://israelhiking.osm.org.il/osrm';

// בדיקת זמינות השרת המקומי
export const checkLocalServerAvailability = async () => {
    try {
        const response = await fetch(`${LOCAL_OSRM_BASE_URL}/route/v1/foot/35.2137,31.7683;35.2137,31.7683`);
        if (!response.ok) {
            throw new Error('Local OSRM server is not responding');
        }
        return true;
    } catch (error) {
        console.warn('Local OSRM server is not available:', error);
        return false;
    }
};

// פונקציה לחישוב מסלול על שבילים מסומנים
export const getMarkedTrailRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        // וידוא שהקואורדינטות תקינות
        if (!startCoords || !endCoords || 
            !Array.isArray(startCoords) || !Array.isArray(endCoords) ||
            startCoords.length !== 2 || endCoords.length !== 2) {
            throw new Error('Invalid coordinates format');
        }

        const isLocalServerAvailable = await checkLocalServerAvailability();
        
        // בניית המסלול עם כל נקודות הציון
        const routePoints = [startCoords];
        if (waypoints && Array.isArray(waypoints)) {
            routePoints.push(...waypoints);
        }
        routePoints.push(endCoords);

        // בניית מערך radiuses באותו אורך כמו מערך הקואורדינטות
        const radiuses = routePoints.map(() => '50');

        // בניית ה-URL עם כל הפרמטרים
        const coordsString = routePoints.map(coord => `${coord[0]},${coord[1]}`).join(';');
        const radiusesString = radiuses.join(';');
        
        const baseUrl = isLocalServerAvailable ? LOCAL_OSRM_BASE_URL : ISRAEL_HIKING_OSRM_URL;
        const url = `${baseUrl}/route/v1/foot/${coordsString}?geometries=polyline&overview=full&alternatives=false&steps=true&annotations=true&continue_straight=true&radiuses=${radiusesString}`;

        console.log('Requesting marked trail route:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OSRM server error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        if (!data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        // המרת ה-polyline לפורמט GeoJSON
        const route = data.routes[0];
        const decodedCoordinates = decode(route.geometry).map(coord => [coord[1], coord[0]]);
        
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: decodedCoordinates
            },
            properties: {
                distance: route.distance,
                duration: route.duration,
                ...route.legs[0].annotation
            }
        };
    } catch (error) {
        console.error('Error getting marked trail route:', error);
        
        // ניסיון להשתמש בשירות הציבורי כגיבוי
        console.log('Falling back to public hiking route service...');
        try {
            const publicRoute = await getPublicHikingRoute(startCoords, endCoords, waypoints);
            return publicRoute;
        } catch (fallbackError) {
            console.error('Fallback route also failed:', fallbackError);
            throw new Error('Could not calculate route using any available service');
        }
    }
};

// הפונקציה המקורית נשארת כגיבוי
export const getLocalRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        return await getMarkedTrailRoute(startCoords, endCoords, waypoints);
    } catch (error) {
        console.log('Falling back to regular route...');
        return await getPublicRoute(startCoords, endCoords, waypoints);
    }
};
