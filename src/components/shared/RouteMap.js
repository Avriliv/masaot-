// src/components/shared/RouteMap.js
import React, { useState, useEffect, useRef } from 'react';
import { 
   MapContainer, 
   TileLayer, 
   Marker, 
   Popup, 
   Polyline, 
   LayersControl,
   GeoJSON,
   useMapEvents 
} from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { 
   ResponsiveContainer, 
   LineChart, 
   Line, 
   XAxis, 
   YAxis, 
   Tooltip 
} from 'recharts';
import 'leaflet/dist/leaflet.css';
import '../../styles/RouteMap.css';

const { BaseLayer } = LayersControl;

// אייקונים מותאמים
const customIcons = {
   start: new L.Icon({
       iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
       iconSize: [25, 41],
       iconAnchor: [12, 41],
       popupAnchor: [1, -34],
       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
   }),
   end: new L.Icon({
       iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
       iconSize: [25, 41],
       iconAnchor: [12, 41],
       popupAnchor: [1, -34],
       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
   }),
   waypoint: new L.Icon({
       iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
       iconSize: [25, 41],
       iconAnchor: [12, 41],
       popupAnchor: [1, -34],
       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
   })
};

const RouteMap = () => {
   const [markers, setMarkers] = useState([]);
   const [markedTrails, setMarkedTrails] = useState(null);
   const [currentRoute, setCurrentRoute] = useState(null);
   const [elevationData, setElevationData] = useState(null);
   const [loading, setLoading] = useState(false);
   const [routeStats, setRouteStats] = useState(null);
   const mapRef = useRef(null);

   // טעינת שבילים מסומנים
   useEffect(() => {
       const loadMarkedTrails = async () => {
           setLoading(true);
           try {
               // ניסיון ראשון - API רשמי
               const response = await fetch('https://israelhiking.osm.org.il/api/v1/osm/highways');
               
               if (!response.ok) {
                   throw new Error('Failed to load from primary source');
               }
               
               const data = await response.json();
               const markedTrails = {
                   type: 'FeatureCollection',
                   features: data.features.filter(feature => 
                       feature.properties.highway === 'path' || 
                       feature.properties.trail_visibility === 'good'
                   )
               };
               
               setMarkedTrails(markedTrails);
           } catch (error) {
               console.error('שגיאה בטעינת שבילים:', error);
               // ניסיון שני - מקור גיבוי
               try {
                   const backupResponse = await fetch('https://israelhiking.osm.org.il/api/v1/trails');
                   const backupData = await backupResponse.json();
                   setMarkedTrails(backupData);
               } catch (backupError) {
                   console.error('שגיאה גם במקור הגיבוי:', backupError);
               }
           } finally {
               setLoading(false);
           }
       };

       loadMarkedTrails();
   }, []);

   // חישוב נקודה קרובה על שביל מסומן
   const snapToNearestTrail = (point) => {
       if (!markedTrails?.features) return point;

       let nearestPoint = point;
       let minDistance = Infinity;

       markedTrails.features.forEach(trail => {
           try {
               const line = turf.lineString(trail.geometry.coordinates);
               const snapped = turf.nearestPointOnLine(line, turf.point([point[1], point[0]]));
               const distance = snapped.properties.dist * 1000; // המרה למטרים

               if (distance < minDistance && distance < 50) { // מקסימום 50 מטר מהשביל
                   minDistance = distance;
                   nearestPoint = [snapped.geometry.coordinates[1], snapped.geometry.coordinates[0]];
               }
           } catch (error) {
               console.error('שגיאה בחישוב מרחק משביל:', error);
           }
       });

       return nearestPoint;
   };

   // טיפול בלחיצה על המפה
   const handleMapClick = async (e) => {
       const clickedPoint = [e.latlng.lat, e.latlng.lng];
       const snappedPoint = snapToNearestTrail(clickedPoint);

       if (snappedPoint) {
           const newMarker = {
               id: Date.now(),
               position: snappedPoint,
               type: markers.length === 0 ? 'start' : 
                     markers.length === 1 ? 'end' : 'waypoint'
           };

           const updatedMarkers = [...markers, newMarker];
           setMarkers(updatedMarkers);

           if (updatedMarkers.length >= 2) {
               await calculateRouteAndElevation(updatedMarkers);
           }
       } else {
           alert('נא לבחור נקודה על שביל מסומן');
       }
   };

   // חישוב מסלול וגבהים
   const calculateRouteAndElevation = async (points) => {
       try {
           const positions = points.map(p => p.position);
           const line = turf.lineString(positions.map(p => [p[1], p[0]]));
           const length = turf.length(line, { units: 'kilometers' });

           // קבלת נתוני גובה
           const elevations = await fetchElevationData(positions);
           
           if (elevations) {
               const elevationData = elevations.map((elevation, index) => ({
                   distance: index === 0 ? 0 : turf.length(
                       turf.lineString(positions.slice(0, index + 1).map(p => [p[1], p[0]])),
                       { units: 'kilometers' }
                   ),
                   elevation: elevation
               }));

               setElevationData(elevationData);
               setRouteStats({
                   distance: length,
                   estimatedTime: length * 0.3 // הערכת זמן: 3.3 קמ"ש
               });
           }

           setCurrentRoute(positions);
       } catch (error) {
           console.error('שגיאה בחישוב מסלול:', error);
       }
   };

   // קבלת נתוני גובה
   const fetchElevationData = async (points) => {
       try {
           const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   locations: points.map(point => ({
                       latitude: point[0],
                       longitude: point[1]
                   }))
               })
           });

           const data = await response.json();
           return data.results.map(r => r.elevation);
       } catch (error) {
           console.error('שגיאה בקבלת נתוני גובה:', error);
           return null;
       }
   };

   // קומפוננטת לחיצות על המפה
   const MapClickHandler = () => {
       useMapEvents({
           click: handleMapClick
       });
       return null;
   };

   return (
       <div className="map-container">
           <MapContainer
               center={[31.7683, 35.2137]}
               zoom={8}
               style={{ height: '600px', width: '100%' }}
               ref={mapRef}
           >
               <MapClickHandler />

               <TileLayer 
                   url="https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png"
                   attribution='© Israel Hiking Map'
               />

               {markedTrails && (
                   <GeoJSON
                       data={markedTrails}
                       style={{
                           color: '#ff4400',
                           weight: 2,
                           opacity: 0.6
                       }}
                   />
               )}

               {markers.map(marker => (
                   <Marker
                       key={marker.id}
                       position={marker.position}
                       icon={customIcons[marker.type]}
                   >
                       <Popup>
                           <div>
                               <strong>
                                   {marker.type === 'start' ? 'התחלה' :
                                    marker.type === 'end' ? 'סיום' : 'נקודת ציון'}
                               </strong>
                               <br />
                               נ.צ.: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                           </div>
                       </Popup>
                   </Marker>
               ))}

               {currentRoute && (
                   <Polyline
                       positions={currentRoute}
                       color="#1e90ff"
                       weight={3}
                   />
               )}
           </MapContainer>

           {routeStats && (
               <div className="route-info">
                   <h3>פרטי המסלול</h3>
                   <div>אורך: {routeStats.distance.toFixed(1)} ק"מ</div>
                   <div>זמן משוער: {routeStats.estimatedTime.toFixed(1)} שעות</div>
               </div>
           )}

           {elevationData && (
               <div className="elevation-chart">
                   <h3>פרופיל גבהים</h3>
                   <ResponsiveContainer width="100%" height={200}>
                       <LineChart data={elevationData}>
                           <XAxis 
                               dataKey="distance" 
                               label={{ value: 'מרחק (ק"מ)', position: 'bottom' }}
                           />
                           <YAxis 
                               label={{ 
                                   value: 'גובה (מטרים)',
                                   angle: -90,
                                   position: 'left'
                               }}
                           />
                           <Tooltip />
                           <Line 
                               type="monotone"
                               dataKey="elevation"
                               stroke="#1e90ff"
                               dot={false}
                           />
                       </LineChart>
                   </ResponsiveContainer>
               </div>
           )}
       </div>
   );
};

export default RouteMap;