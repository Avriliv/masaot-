// המרת קואורדינטות ל-UTM
export const toUTM = (lat, lon) => {
    // חישוב אזור UTM
    const zone = Math.floor((lon + 180) / 6) + 1;
    const letter = lat >= 84 ? 'X' :
        lat >= 72 ? 'W' : lat >= 64 ? 'V' : lat >= 56 ? 'U' : lat >= 48 ? 'T' :
        lat >= 40 ? 'S' : lat >= 32 ? 'R' : lat >= 24 ? 'Q' : lat >= 16 ? 'P' :
        lat >= 8 ? 'N' : lat >= 0 ? 'M' : lat >= -8 ? 'L' : lat >= -16 ? 'K' :
        lat >= -24 ? 'J' : lat >= -32 ? 'H' : lat >= -40 ? 'G' : lat >= -48 ? 'F' :
        lat >= -56 ? 'E' : lat >= -64 ? 'D' : lat >= -72 ? 'C' : 'B';

    return `${zone}${letter}`;
};

// המרת קואורדינטות למעלות, דקות ושניות
export const toDMS = (decimal) => {
    const deg = Math.floor(Math.abs(decimal));
    const min = Math.floor((Math.abs(decimal) - deg) * 60);
    const sec = ((Math.abs(decimal) - deg - min / 60) * 3600).toFixed(1);
    return `${deg}° ${min}' ${sec}"`;
};

// פונקציה לפורמט קואורדינטות
export const formatCoordinates = (coordinates) => {
    const [lat, lon] = coordinates;
    const utm = toUTM(lat, lon);
    const latDMS = toDMS(lat) + (lat >= 0 ? 'N' : 'S');
    const lonDMS = toDMS(lon) + (lon >= 0 ? 'E' : 'W');

    return {
        utm: `UTM ${utm}`,
        dms: `${latDMS} ${lonDMS}`,
        decimal: `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`
    };
};

// בדיקת תקינות קואורדינטות
export const validateCoordinates = (coordinates) => {
    console.log('Validating coordinates:', coordinates);
    
    // בדיקת פורמט בסיסי
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        console.error('Invalid coordinate format:', coordinates);
        return false;
    }

    const [lat, lon] = coordinates;

    // בדיקת סוג הנתונים
    if (typeof lat !== 'number' || typeof lon !== 'number') {
        console.error('Non-numeric coordinates:', { lat, lon });
        return false;
    }

    // בדיקת טווח תקין
    if (lat < 29 || lat > 34 || lon < 34 || lon > 36) {
        console.warn('Coordinates outside Israel:', { lat, lon });
        return false;
    }

    return true;
};

// המרת מערך קואורדינטות לפורמט GeoJSON
export const toGeoJSON = (coordinates) => {
    if (!Array.isArray(coordinates)) {
        console.error('Invalid coordinates array:', coordinates);
        return null;
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: coordinates.map(coord => {
                if (!validateCoordinates(coord)) {
                    console.warn('Invalid coordinate in array:', coord);
                    return null;
                }
                return [coord[1], coord[0]]; // המרה ל-[lon, lat] עבור GeoJSON
            }).filter(coord => coord !== null)
        }
    };
};

// קבלת גבולות מרובעים מרשימת נקודות
export const getBoundsFromPoints = (points) => {
    console.log('Calculating bounds from points:', points);
    
    if (!points || points.length === 0) {
        console.error('No points provided for bounds calculation');
        return null;
    }

    // חילוץ הקואורדינטות מהנקודות
    const coordinates = points
        .filter(point => point && point.coordinates)
        .map(point => point.coordinates);

    if (coordinates.length === 0) {
        console.error('No valid coordinates found in points');
        return null;
    }

    // חישוב ערכי מינימום ומקסימום
    const lats = coordinates.map(coord => coord[0]);
    const lons = coordinates.map(coord => coord[1]);
    
    const bounds = [
        Math.min(...lons), // west
        Math.min(...lats), // south
        Math.max(...lons), // east
        Math.max(...lats)  // north
    ];

    // הוספת שוליים לגבולות
    const padding = 0.1; // ~11km
    bounds[0] -= padding;
    bounds[1] -= padding;
    bounds[2] += padding;
    bounds[3] += padding;

    console.log('Calculated bounds:', bounds);
    return bounds;
};

// בדיקה האם נקודה נמצאת בתוך ישראל
export const isPointInIsrael = (lat, lon) => {
    // גבולות משוערים של ישראל
    const ISRAEL_BOUNDS = {
        minLat: 29.0,  // אילת
        maxLat: 34.0,  // ראש הנקרה
        minLon: 34.0,  // חוף הים התיכון
        maxLon: 36.0   // רמת הגולן
    };

    return (
        lat >= ISRAEL_BOUNDS.minLat &&
        lat <= ISRAEL_BOUNDS.maxLat &&
        lon >= ISRAEL_BOUNDS.minLon &&
        lon <= ISRAEL_BOUNDS.maxLon
    );
};

// חישוב מרחק בין שתי נקודות בקילומטרים
export const calculateDistance = (point1, point2) => {
    if (!point1?.coordinates || !point2?.coordinates) {
        console.error('Invalid points for distance calculation:', { point1, point2 });
        return null;
    }

    const [lat1, lon1] = point1.coordinates;
    const [lat2, lon2] = point2.coordinates;

    if (!validateCoordinates([lat1, lon1]) || !validateCoordinates([lat2, lon2])) {
        console.error('Invalid coordinates for distance calculation');
        return null;
    }

    // נוסחת Haversine לחישוב מרחק על פני כדור הארץ
    const R = 6371; // רדיוס כדור הארץ בקילומטרים
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
};

// המרה למעלות רדיאן
const toRad = (degrees) => {
    return degrees * Math.PI / 180;
};
