import { decode } from '@mapbox/polyline';
import { isValidCoordinates, isPointInIsrael } from './MapService';

// עדכון כתובות השרתים
const OSRM_SERVER = 'http://localhost:5000';  // השרת המקומי שלנו
const FALLBACK_SERVER = 'https://routing.openstreetmap.de/routed-foot';  // שרת גיבוי

// בדיקת זמינות השרת המקומי
const checkLocalServerAvailability = async () => {
  try {
    const response = await fetch(`${OSRM_SERVER}/health`);
    return response.ok;
  } catch (error) {
    console.warn('Local OSRM server not available:', error);
    return false;
  }
};

// בדיקת זמינות השרת הציבורי
export const checkPublicServerAvailability = async () => {
  try {
    console.log('בודק זמינות שרת OSRM ציבורי...');
    const testCoords = '35.2137,31.7683;35.2137,31.7684';
    const testUrl = `${FALLBACK_SERVER}/route/v1/foot/${testCoords}`;
    console.log('שולח בקשת בדיקה ל:', testUrl);

    const response = await fetch(testUrl);
    console.log('קוד תשובה:', response.status);

    const data = await response.json();
    console.log('תשובה התקבלה:', data);

    if (response.ok && data.code === 'Ok') {
      console.log('שרת OSRM ציבורי זמין ועובד!');
      return true;
    }

    console.warn('שרת OSRM ציבורי לא מגיב כראוי');
    return false;
  } catch (error) {
    console.error('שגיאה בבדיקת זמינות שרת OSRM ציבורי:', error);
    return false;
  }
};

// מטמון לתוצאות חישוב מסלולים
const routeCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 60; // שעה אחת

// פונקציה לחישוב מפתח מטמון
const getCacheKey = (startCoords, endCoords, waypoints = []) => {
  const points = [startCoords, ...waypoints, endCoords]
    .map(coords => coords.join(','))
    .join(';');
  return points;
};

// המרת קואורדינטות לפורמט OSRM
const convertToOSRMFormat = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    console.warn('Invalid coordinates:', coords);
    return null;
  }

  const [lon, lat] = coords;
  if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) {
    console.warn('Invalid coordinate values:', { lon, lat });
    return null;
  }

  return [lon, lat];
};

// חישוב מסלול בין שתי נקודות
export const getMarkedTrailRoute = async ({ start, end, waypoints = [] }) => {
  console.log('getMarkedTrailRoute called with:', { start, end, waypoints });

  // וידוא שהקואורדינטות תקינות
  if (!start || !end || !Array.isArray(start) || !Array.isArray(end) || start.length !== 2 || end.length !== 2) {
    console.error('Invalid coordinates:', { start, end });
    throw new Error('קואורדינטות לא תקינות');
  }

  // וידוא שהערכים הם מספרים
  if (!start.every(coord => typeof coord === 'number' && !isNaN(coord)) || 
      !end.every(coord => typeof coord === 'number' && !isNaN(coord))) {
    console.error('Coordinates contain non-numeric values:', { start, end });
    throw new Error('קואורדינטות מכילות ערכים לא מספריים');
  }

  try {
    // בדיקת המטמון
    const cacheKey = getCacheKey(start, end, waypoints);
    const cachedRoute = routeCache.get(cacheKey);
    if (cachedRoute && Date.now() - cachedRoute.timestamp < CACHE_EXPIRY) {
      console.log('Returning cached route');
      return cachedRoute.route;
    }

    // בדיקת זמינות השרת המקומי
    const isLocalServerAvailable = await checkLocalServerAvailability();
    const serverToUse = isLocalServerAvailable ? OSRM_SERVER : FALLBACK_SERVER;
    console.log(`Using OSRM server: ${serverToUse}`);

    // הקואורדינטות כבר בפורמט [lon, lat]
    const coordinates = [start, ...waypoints, end];
    console.log('Coordinates for OSRM:', coordinates);

    const coordinateString = coordinates
      .map(coord => coord.join(','))
      .join(';');

    const url = `${serverToUse}/route/v1/foot/${coordinateString}?overview=full&geometries=geojson&annotations=true`;
    console.log('OSRM URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OSRM response:', data);

    if (!data.routes || !data.routes[0]) {
      throw new Error('לא נמצא מסלול');
    }

    // שמירה במטמון
    const route = data.routes[0];
    routeCache.set(cacheKey, {
      route,
      timestamp: Date.now()
    });

    return route;
  } catch (error) {
    console.error('Error in getMarkedTrailRoute:', error);
    throw error;
  }
};

// הפונקציה הראשית לחישוב מסלול
export const getLocalRoute = async (startCoords, endCoords, waypoints = []) => {
  return getMarkedTrailRoute({ start: startCoords, end: endCoords, waypoints });
};
