import { useMapEvents } from 'react-leaflet';

const MapEvents = ({ onClick }) => {
    useMapEvents({
        click: onClick
    });
    return null;
};

export default MapEvents;
