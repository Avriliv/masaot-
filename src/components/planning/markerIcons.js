import L from 'leaflet';

// יצירת אייקון מרקר בצבע מותאם אישית
const createColoredMarkerIcon = (color) => {
    const markerHtmlStyles = `
        background-color: ${color};
        width: 1.2rem;
        height: 1.2rem;
        display: block;
        position: relative;
        border-radius: 2rem 2rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    `;

    return L.divIcon({
        className: "custom-marker-icon",
        html: `<span style="${markerHtmlStyles}" />`,
        iconAnchor: [8, 16],
        popupAnchor: [0, -24],
        iconSize: [16, 16]
    });
};

// יצירת האייקונים
export const markerIcons = {
    start: createColoredMarkerIcon('#4CAF50'),    // ירוק
    end: createColoredMarkerIcon('#f44336'),      // אדום
    stop: createColoredMarkerIcon('#2196F3'),     // כחול
    camping: createColoredMarkerIcon('#9C27B0'),  // סגול
    attraction: createColoredMarkerIcon('#FFC107'),// צהוב
    water: createColoredMarkerIcon('#00BCD4')     // תכלת
};

// סוגי הנקודות
export const POINT_TYPES = {
    START: { id: 'start', label: 'נקודת התחלה', color: '#4CAF50' },
    END: { id: 'end', label: 'נקודת סיום', color: '#f44336' },
    STOP: { id: 'stop', label: 'נקודת עצירה', color: '#2196F3' },
    CAMPING: { id: 'camping', label: 'נקודת לינה', color: '#9C27B0' },
    ATTRACTION: { id: 'attraction', label: 'אטרקציה', color: '#FFC107' },
    WATER: { id: 'water', label: 'נקודת מים', color: '#00BCD4' }
};
