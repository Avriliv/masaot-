import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CONFIG, MapService } from '../../services/MapService';
import { useTrip } from '../../context/TripContext';

// הגדרת ה-token של Mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// קומפוננטת מפה משופרת
const EnhancedMap = ({ onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { tripData } = useTrip();
  const [dailyRoutes, setDailyRoutes] = useState([]);

  // אתחול המפה
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        maxBounds: [
          [MAP_CONFIG.bounds.west, MAP_CONFIG.bounds.south],
          [MAP_CONFIG.bounds.east, MAP_CONFIG.bounds.north]
        ]
      });

      // הוספת שכבות שבילים
      map.current.on('load', () => {
        // הוספת שכבת שבילי טיולים
        const tileLayerConfig = {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        };
        map.current.addSource('hiking-trails', {
          type: 'raster',
          tiles: [tileLayerConfig.url],
          tileSize: 256,
          attribution: tileLayerConfig.attribution
        });

        map.current.addLayer({
          id: 'hiking-trails',
          type: 'raster',
          source: 'hiking-trails',
          paint: {
            'raster-opacity': 0.6
          }
        });

        Object.values(MAP_CONFIG.layers).forEach(layer => {
          map.current.addLayer(layer);
        });
      });

      // הוספת אינטראקטיביות
      map.current.on('click', (e) => {
        if (onLocationSelect) {
          onLocationSelect([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      // הוספת כפתורי זום
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }
  }, []);

  // עדכון מסלולים על המפה
  useEffect(() => {
    if (!map.current || !tripData?.route?.geometry) return;

    console.log('Updating routes:', tripData.route);
    const numDays = tripData.basicDetails?.numDays || 1;
    const routes = MapService.splitRouteByDays(tripData.route, numDays);
    setDailyRoutes(routes);

    // הסרת שכבות קודמות
    routes.forEach((_, index) => {
      const layerId = `route-day-${index + 1}`;
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
        map.current.removeSource(layerId);
      }
    });

    // הוספת שכבות חדשות
    routes.forEach((route, index) => {
      const layerId = `route-day-${index + 1}`;
      const color = `hsl(${(index * 137.5) % 360}, 70%, 50%)`; // צבע שונה לכל יום

      map.current.addSource(layerId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: route.geometry,
          properties: route.properties
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    // התאמת תצוגת המפה למסלול
    if (tripData.route.geometry.coordinates.length > 0) {
      const { center, zoom } = MapService.calculateOptimalView(
        tripData.route.geometry.coordinates
      );
      map.current.flyTo({ center, zoom });
    }

  }, [tripData?.route, tripData?.basicDetails?.numDays]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ height: '100%' }} />
      {dailyRoutes.length > 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 10, 
            right: 60, 
            background: 'white', 
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
        >
          {dailyRoutes.map((route, index) => {
            const details = MapService.calculateDayDetails(route);
            return (
              <div key={index} style={{ marginBottom: '10px' }}>
                <h4>יום {route.properties.day}</h4>
                <div>מרחק: {details.distance.toFixed(1)} ק"מ</div>
                <div>זמן: {Math.round(details.duration)} דקות</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedMap;
