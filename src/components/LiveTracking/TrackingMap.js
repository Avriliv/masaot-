import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress } from '@mui/material';

// מייבא את האייקונים של leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// קומפוננטה לעדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng]);
    }
  }, [center, map]);
  
  return null;
};

const TrackingMap = ({ currentLocation, activeTrips = [], sosLocations = [] }) => {
  const [mapCenter, setMapCenter] = useState(null);
  const defaultCenter = [32.794, 35.523]; // מרכז ברירת מחדל - הרדוף

  useEffect(() => {
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

  // אם אין מיקום, מראה מסך טעינה
  if (!mapCenter && !currentLocation) {
    return (
      <Box 
        sx={{ 
          height: '100%', 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MapContainer
      center={mapCenter || defaultCenter}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {mapCenter && <MapUpdater center={{ lat: mapCenter[0], lng: mapCenter[1] }} />}

      {/* סמן המיקום הנוכחי */}
      {currentLocation && currentLocation.latitude && currentLocation.longitude && (
        <Marker position={[currentLocation.latitude, currentLocation.longitude]} />
      )}

      {/* סמני טיולים פעילים */}
      {activeTrips.map((trip, index) => 
        trip.currentLocation && (
          <Marker
            key={`trip-${index}`}
            position={[trip.currentLocation.latitude, trip.currentLocation.longitude]}
          />
        )
      )}

      {/* סמני SOS */}
      {sosLocations.map((sos, index) => 
        sos.location && (
          <Marker
            key={`sos-${index}`}
            position={[sos.location.latitude, sos.location.longitude]}
            icon={new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: iconShadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>
              <div style={{ direction: 'rtl', textAlign: 'right' }}>
                <h3>קריאת מצוקה!</h3>
                <p><strong>זמן:</strong> {new Date(sos.timestamp).toLocaleTimeString()}</p>
                {sos.sender && (
                  <p><strong>שולח:</strong> {sos.sender.name} ({sos.sender.role})</p>
                )}
                <p><strong>סטטוס:</strong> {sos.status === 'active' ? 'פעיל' : 'טופל'}</p>
                <p><strong>מיקום:</strong> {sos.location.latitude.toFixed(6)}, {sos.location.longitude.toFixed(6)}</p>
                <p><strong>דיוק:</strong> {Math.round(sos.location.accuracy)} מטרים</p>
                {sos.message && (
                  <p><strong>הודעה:</strong> {sos.message}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      )}
    </MapContainer>
  );
};

export default TrackingMap;
