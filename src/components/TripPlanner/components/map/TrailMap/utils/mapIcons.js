import L from 'leaflet';

// יצירת אייקון מותאם אישית
export const createCustomIcon = (color, text) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
                ${text}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

// אייקונים לנקודות שונות במסלול
export const startIcon = createCustomIcon('#4CAF50', 'S');
export const middleIcon = createCustomIcon('#FF9800', 'M');
export const endIcon = createCustomIcon('#F44336', 'E');
