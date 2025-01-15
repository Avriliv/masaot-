import axios from 'axios';

// קבועים גלובליים
const OSRM_BASE_URL = 'http://localhost:7070';  // שרת OSRM מקומי
const PROXY_URL = '';  // אין צורך בפרוקסי לשרת מקומי

// הגדרת גבולות ישראל המדויקים
const israelBounds = {
    south: 29.4, // אילת
    west: 34.2,  // מערב הנגב
    north: 33.4, // הר דב
    east: 35.9   // רמת הגולן
};

// פונקציות עזר
const isValidCoordinates = (coords) => {
    return Array.isArray(coords) && 
           coords.length === 2 && 
           !isNaN(coords[0]) && 
           !isNaN(coords[1]) &&
           coords[0] >= -180 && 
           coords[0] <= 180 && 
           coords[1] >= -90 && 
           coords[1] <= 90;
};

const isPointInIsrael = (coords) => {
    const [lon, lat] = coords;
    return lat >= 29.5 && lat <= 33.3 && // גבולות הרוחב של ישראל
           lon >= 34.2 && lon <= 35.9;    // גבולות האורך של ישראל
};

const getHebrewErrorMessage = (error) => {
    switch (error) {
        case 'Invalid coordinates':
            return 'קואורדינטות לא תקינות';
        case 'Service unavailable':
            return 'שרת הניתוב אינו זמין כרגע. אנא נסה שוב מאוחר יותר';
        case 'No route found':
            return 'לא נמצא מסלול בין הנקודות שנבחרו';
        case 'Start point is outside Israel':
            return 'נקודת ההתחלה מחוץ לגבולות ישראל';
        case 'End point is outside Israel':
            return 'נקודת הסיום מחוץ לגבולות ישראל';
        default:
            return 'שגיאה בחישוב המסלול. אנא נסה שוב';
    }
};

export const getRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        // Validate coordinates
        if (!Array.isArray(startCoords) || startCoords.length !== 2 ||
            !Array.isArray(endCoords) || endCoords.length !== 2) {
            throw new Error('Invalid coordinates format');
        }

        // בדיקה שהנקודות בתוך ישראל
        if (!isPointInIsrael(startCoords)) {
            throw new Error('Start point is outside Israel');
        }
        if (!isPointInIsrael(endCoords)) {
            throw new Error('End point is outside Israel');
        }

        console.log('Getting route for:', { startCoords, endCoords, waypoints });

        // Format coordinates for OSRM API - coordinates should be in [longitude, latitude] format
        const coordinates = [startCoords, ...waypoints, endCoords]
            .map(coord => `${coord[0]},${coord[1]}`)  // Already in [longitude, latitude] format
            .join(';');

        // OSRM expects coordinates in the format: longitude,latitude
        const osrmUrl = `${OSRM_BASE_URL}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&annotations=true`;
        const url = `${PROXY_URL}${encodeURIComponent(osrmUrl)}`;
        
        console.log('Requesting URL:', url);

        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OSRM API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                contentType,
                errorText
            });
            throw new Error(`Failed to fetch route: ${response.status} ${response.statusText}`);
        }

        if (!contentType?.includes('application/json')) {
            console.error('Invalid content type:', contentType);
            throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        console.log('Parsed response:', data);
        
        if (!data.routes || data.routes.length === 0) {
            console.error('No route found in response:', data);
            throw new Error('No route found');
        }

        const route = data.routes[0];
        console.log('Route received:', route);

        // בדיקה שכל נקודות המסלול בתוך ישראל
        const allPointsInIsrael = route.geometry.coordinates.every(isPointInIsrael);
        if (!allPointsInIsrael) {
            throw new Error('Route goes outside Israel');
        }

        return {
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            legs: route.legs
        };
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error;
    }
};

export const getHikingRoute = async (startCoords, endCoords, waypoints = []) => {
    try {
        // בדיקת תקינות הקואורדינטות
        if (!isValidCoordinates(startCoords) || !isValidCoordinates(endCoords)) {
            throw new Error('Invalid coordinates');
        }

        // בדיקה שהנקודות בתוך ישראל
        if (!isPointInIsrael(startCoords)) {
            throw new Error('Start point is outside Israel');
        }
        if (!isPointInIsrael(endCoords)) {
            throw new Error('End point is outside Israel');
        }

        // בניית המסלול עם נקודות הביניים
        const coordinates = [startCoords];
        if (waypoints && waypoints.length > 0) {
            coordinates.push(...waypoints);
        }
        coordinates.push(endCoords);

        // בניית ה-URL לבקשה
        const coordinatesString = coordinates
            .map(coord => `${coord[0]},${coord[1]}`)
            .join(';');
            
        const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinatesString}`;
        const params = {
            overview: 'full',
            geometries: 'geojson',
            annotations: true,
            steps: true
        };

        // שליחת הבקשה ל-OSRM
        const response = await axios.get(url, { params });
        
        // בדיקת תקינות התשובה
        if (!response.data || !response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = response.data.routes[0];
        
        // המרת התוצאה לפורמט הנדרש
        return {
            geometry: route.geometry,
            distance: route.distance,
            duration: route.duration,
            legs: route.legs.map(leg => ({
                steps: leg.steps,
                distance: leg.distance,
                duration: leg.duration
            }))
        };

    } catch (error) {
        if (error.response) {
            // שגיאת שרת
            if (error.response.status === 503) {
                throw new Error('Service unavailable');
            }
        }
        // העברת השגיאה המקורית אם היא מהבדיקות שלנו
        if (error.message === 'Invalid coordinates' || 
            error.message === 'No route found' ||
            error.message === 'Service unavailable' ||
            error.message === 'Start point is outside Israel' ||
            error.message === 'End point is outside Israel') {
            throw error;
        }
        // שגיאה כללית
        throw new Error('Service unavailable');
    }
};

// רשימת שרתי ניתוב זמינים
const ROUTING_SERVICES = [
    {
        name: 'OSRM Local',
        url: `${OSRM_BASE_URL}/route/v1/driving/`,
        type: 'hiking'
    }
];

// פונקציה לבדיקת זמינות השירות
const checkServiceAvailability = async (service) => {
    try {
        const response = await fetch(service.url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

export const calculateElevation = async (coordinates) => {
    try {
        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length === 0) {
            throw new Error('Invalid coordinates format');
        }

        // בדיקה שכל נקודות המסלול בתוך ישראל
        const allPointsInIsrael = coordinates.every(isPointInIsrael);
        if (!allPointsInIsrael) {
            throw new Error('Route goes outside Israel');
        }

        const coordString = coordinates
            .map(coord => `${coord[0]},${coord[1]}`)
            .join(';');

        const osrmUrl = `${OSRM_BASE_URL}/route/v1/hiking/${coordString}?annotations=true&geometries=geojson`;
        const url = `${PROXY_URL}${encodeURIComponent(osrmUrl)}`;
        
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OSRM API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                contentType,
                errorText
            });
            throw new Error(`Failed to fetch elevation data: ${response.status} ${response.statusText}`);
        }

        if (!contentType?.includes('application/json')) {
            console.error('Invalid content type:', contentType);
            throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        
        if (!data.routes || data.routes.length === 0) {
            console.error('No elevation data found in response:', data);
            throw new Error('No elevation data found');
        }

        const nodes = data.routes[0].legs.flatMap(leg => leg.annotation.nodes);
        const elevationData = await getElevationForNodes(nodes);

        return {
            elevation: elevationData,
            ascent: calculateTotalAscent(elevationData),
            descent: calculateTotalDescent(elevationData)
        };
    } catch (error) {
        console.error('Error calculating elevation:', error);
        throw error;
    }
};

export const splitRouteIntoSegments = async (route, numberOfDays) => {
    if (!route || !route.geometry || !route.geometry.coordinates) {
        throw new Error('Invalid route data');
    }

    // בדיקה שכל נקודות המסלול בתוך ישראל
    const allPointsInIsrael = route.geometry.coordinates.every(isPointInIsrael);
    if (!allPointsInIsrael) {
        throw new Error('Route goes outside Israel');
    }

    const totalDistance = route.distance;
    const distancePerDay = totalDistance / numberOfDays;
    const segments = [];
    let currentDistance = 0;
    let currentSegment = {
        coordinates: [route.geometry.coordinates[0]],
        distance: 0,
        duration: 0
    };

    for (let i = 1; i < route.geometry.coordinates.length; i++) {
        const coord1 = route.geometry.coordinates[i - 1];
        const coord2 = route.geometry.coordinates[i];
        const segmentDistance = calculateDistance(coord1, coord2);

        currentDistance += segmentDistance;
        currentSegment.coordinates.push(coord2);
        currentSegment.distance += segmentDistance;

        if (currentDistance >= distancePerDay || i === route.geometry.coordinates.length - 1) {
            segments.push({
                ...currentSegment,
                geometry: {
                    type: 'LineString',
                    coordinates: currentSegment.coordinates
                }
            });

            if (i < route.geometry.coordinates.length - 1) {
                currentSegment = {
                    coordinates: [coord2],
                    distance: 0,
                    duration: 0
                };
                currentDistance = 0;
            }
        }
    }

    // Calculate elevation for each segment
    const segmentsWithElevation = await Promise.all(
        segments.map(async (segment) => {
            const elevation = await calculateElevation(segment.coordinates);
            return {
                ...segment,
                elevation
            };
        })
    );

    return segmentsWithElevation;
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1[1] * Math.PI / 180;
    const φ2 = coord2[1] * Math.PI / 180;
    const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
    const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
};

const calculateTotalAscent = (elevationData) => {
    let totalAscent = 0;
    for (let i = 1; i < elevationData.length; i++) {
        const diff = elevationData[i] - elevationData[i-1];
        if (diff > 0) totalAscent += diff;
    }
    return totalAscent;
};

const calculateTotalDescent = (elevationData) => {
    let totalDescent = 0;
    for (let i = 1; i < elevationData.length; i++) {
        const diff = elevationData[i-1] - elevationData[i];
        if (diff > 0) totalDescent += diff;
    }
    return totalDescent;
};

// Mock function - replace with actual elevation API call
const getElevationForNodes = async (nodes) => {
    // For now, return mock elevation data
    return nodes.map(() => Math.random() * 1000);
};
