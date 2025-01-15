import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as turf from '@turf/turf';

const MapFocus = ({ route, dailyLocations }) => {
    const map = useMap();

    useEffect(() => {
        if (!route || !dailyLocations || route.length === 0) return;

        // יצירת מערך של נקודות המסלול
        const points = route.map(coord => [coord[0], coord[1]]);
        
        // חישוב גבולות המסלול
        const bounds = turf.bbox(turf.lineString(points));
        
        // הוספת שוליים לגבולות
        const padding = 0.1; // 10% שוליים
        const latDiff = bounds[3] - bounds[1];
        const lngDiff = bounds[2] - bounds[0];
        
        const extendedBounds = [
            bounds[0] - lngDiff * padding,
            bounds[1] - latDiff * padding,
            bounds[2] + lngDiff * padding,
            bounds[3] + latDiff * padding
        ];

        // התמקדות במסלול
        map.fitBounds([
            [extendedBounds[1], extendedBounds[0]],
            [extendedBounds[3], extendedBounds[2]]
        ]);
    }, [map, route, dailyLocations]);

    return null;
};

export default MapFocus;
