import { getMarkedTrailRoute } from './LocalOSRMService';

// Map configuration
export const MAP_CONFIG = {
  center: [35.2137, 31.7683], // ירושלים [lon, lat]
  zoom: 8,
  minZoom: 7,
  maxZoom: 16,
  bounds: [
    [34.2674, 29.4533], // דרום מערב [lon, lat]
    [35.8950, 33.4356]  // צפון מזרח [lon, lat]
  ]
};

// Map helper functions
export const MapService = {
  // Split route by days
  splitRouteByDays(route, numDays) {
    if (!route || !route.geometry || !route.geometry.coordinates || numDays < 1) {
      return [];
    }

    const coordinates = route.geometry.coordinates;
    const totalPoints = coordinates.length;
    const pointsPerDay = Math.ceil(totalPoints / numDays);
    
    return Array.from({ length: numDays }, (_, index) => {
      const start = index * pointsPerDay;
      const end = Math.min(start + pointsPerDay, totalPoints);
      
      return {
        geometry: {
          type: 'LineString',
          coordinates: coordinates.slice(start, end)
        },
        properties: {
          day: index + 1,
          distance: route.distance ? (route.distance / numDays) : 0,
          duration: route.duration ? (route.duration / numDays) : 0
        }
      };
    });
  },

  // Calculate optimal view for route
  calculateOptimalView(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return MAP_CONFIG.center;
    }

    const bounds = coordinates.reduce(
      (acc, coord) => ({
        north: Math.max(acc.north, coord[1]),
        south: Math.min(acc.south, coord[1]),
        east: Math.max(acc.east, coord[0]),
        west: Math.min(acc.west, coord[0])
      }),
      { ...MAP_CONFIG.bounds }
    );

    return {
      center: [
        (bounds.east + bounds.west) / 2,
        (bounds.north + bounds.south) / 2
      ],
      zoom: this.calculateZoomLevel(bounds)
    };
  },

  // Calculate zoom level
  calculateZoomLevel(bounds) {
    const WORLD_SIZE = 512;
    const ZOOM_MAX = 18;
    
    const latRatio = (bounds.north - bounds.south) / 180;
    const lngRatio = (bounds.east - bounds.west) / 360;
    const ratio = Math.max(latRatio, lngRatio);
    
    const zoom = Math.floor(Math.log2(WORLD_SIZE / ratio));
    return Math.min(zoom, ZOOM_MAX);
  },

  // Calculate day details
  calculateDayDetails(segment) {
    return {
      distance: segment.properties.distance,
      duration: segment.properties.duration,
      elevation: {
        gain: segment.properties.elevation_gain || 0,
        loss: segment.properties.elevation_loss || 0
      },
      difficulty: this.calculateDifficulty(segment)
    };
  },

  // Calculate difficulty
  calculateDifficulty(distance = 0, ascent = 0) {
    // Convert to km
    const distanceKm = distance / 1000;
    
    // Calculate difficulty score
    const difficultyScore = (distanceKm * 0.3) + (ascent * 0.001);
    
    // Determine difficulty level
    if (difficultyScore < 3) return 'קל';
    if (difficultyScore < 6) return 'קל-בינוני';
    if (difficultyScore < 10) return 'בינוני';
    if (difficultyScore < 15) return 'בינוני-קשה';
    return 'קשה';
  },

  // Calculate route details
  calculateRouteDetails(route) {
    if (!route?.geometry?.coordinates) {
      return {
        distance: 0,
        duration: 0,
        ascent: 0,
        descent: 0,
        difficulty: 'לא ידוע'
      };
    }

    const coordinates = route.geometry.coordinates;
    let distance = 0;
    let ascent = 0;
    let descent = 0;

    for (let i = 1; i < coordinates.length; i++) {
      try {
        // Calculate distance
        const segment = this.calculateDistance(
          coordinates[i-1][1], coordinates[i-1][0],
          coordinates[i][1], coordinates[i][0]
        );
        distance += segment || 0;

        // Calculate ascent and descent
        if (coordinates[i-1].length > 2 && coordinates[i].length > 2) {
          const elevDiff = coordinates[i][2] - coordinates[i-1][2];
          if (elevDiff > 0) ascent += elevDiff;
          else descent += Math.abs(elevDiff);
        }
      } catch (error) {
        console.error('Error calculating route details:', error);
      }
    }

    return {
      distance: distance || 0,
      duration: this.estimateHikingDuration(distance || 0, ascent || 0, descent || 0),
      ascent: ascent || 0,
      descent: descent || 0,
      difficulty: this.calculateDifficulty(distance || 0, ascent || 0)
    };
  },

  // Estimate hiking duration
  estimateHikingDuration(distance = 0, ascent = 0, descent = 0) {
    // Average speed in km/h
    const baseSpeed = 4;
    
    // Base time in hours
    let baseTime = distance / 1000 / baseSpeed;
    
    // Add time for ascent (Naismith's rule)
    const ascentTime = (ascent / 300) * (1/baseSpeed);
    
    // Add time for descent
    const descentTime = (descent / 500) * (1/baseSpeed);
    
    // Total time in minutes
    return Math.round((baseTime + ascentTime + descentTime) * 60);
  },

  // Calculate total trip details
  calculateTotalTripDetails(routes) {
    if (!routes || !Array.isArray(routes)) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        totalAscent: 0,
        totalDescent: 0
      };
    }

    return routes.reduce((total, day) => {
      const details = this.calculateRouteDetails(day.route || {});
      return {
        totalDistance: total.totalDistance + (details.distance || 0),
        totalDuration: total.totalDuration + (details.duration || 0),
        totalAscent: total.totalAscent + (details.ascent || 0),
        totalDescent: total.totalDescent + (details.descent || 0)
      };
    }, {
      totalDistance: 0,
      totalDuration: 0,
      totalAscent: 0,
      totalDescent: 0
    });
  },

  // Calculate hiking route
  async calculateHikingRoute(startCoords, endCoords, waypoints = []) {
    try {
      console.log('MapService.calculateHikingRoute: starting with coordinates:', {
        start: startCoords,
        end: endCoords,
        waypoints
      });

      // בדיקה שכל הנקודות בפורמט תקין [lat, lon]
      const validateCoords = (coords, name) => {
        if (!Array.isArray(coords)) {
          console.error(`MapService.calculateHikingRoute: ${name} coordinates must be an array, got:`, coords);
          return false;
        }
        if (coords.length !== 2) {
          console.error(`MapService.calculateHikingRoute: ${name} coordinates must have exactly 2 values, got ${coords.length}:`, coords);
          return false;
        }
        const [lat, lon] = coords;
        if (typeof lat !== 'number' || typeof lon !== 'number') {
          console.error(`MapService.calculateHikingRoute: ${name} coordinates must be numbers, got:`, { lat, lon });
          return false;
        }
        return true;
      };

      // בדיקה שהנקודה בתוך גבולות ישראל
      const checkPoint = ([lat, lon], name) => {
        const israelBounds = {
          south: 29.4,  // אילת
          west: 34.2,   // מערב הנגב
          north: 33.4,  // הר דב
          east: 35.9    // רמת הגולן
        };

        if (lat < israelBounds.south || lat > israelBounds.north ||
            lon < israelBounds.west || lon > israelBounds.east) {
          console.warn(`MapService.calculateHikingRoute: ${name} point [${lat}, ${lon}] is outside Israel's bounds`);
          return false;
        }
        console.log(`MapService.calculateHikingRoute: ${name} point [${lat}, ${lon}] is within Israel's bounds`);
        return true;
      };

      // וידוא תקינות נקודת ההתחלה
      if (!validateCoords(startCoords, 'Start')) {
        throw new Error(`Invalid start coordinates: ${JSON.stringify(startCoords)}`);
      }
      if (!checkPoint(startCoords, 'Start')) {
        throw new Error(`Start point [${startCoords.join(', ')}] is outside Israel's bounds`);
      }

      // וידוא תקינות נקודת הסיום
      if (!validateCoords(endCoords, 'End')) {
        throw new Error(`Invalid end coordinates: ${JSON.stringify(endCoords)}`);
      }
      if (!checkPoint(endCoords, 'End')) {
        throw new Error(`End point [${endCoords.join(', ')}] is outside Israel's bounds`);
      }

      // וידוא תקינות נקודות הביניים
      for (let i = 0; i < waypoints.length; i++) {
        const point = waypoints[i];
        if (!validateCoords(point, `Waypoint ${i}`)) {
          throw new Error(`Invalid waypoint ${i}: ${JSON.stringify(point)}`);
        }
        if (!checkPoint(point, `Waypoint ${i}`)) {
          throw new Error(`Waypoint ${i} [${point.join(', ')}] is outside Israel's bounds`);
        }
      }

      // חישוב המסלול
      console.log('MapService.calculateHikingRoute: calculating route with validated coordinates');
      const route = await getMarkedTrailRoute(startCoords, endCoords, waypoints);
      
      if (!route || !route.geometry) {
        console.error('MapService.calculateHikingRoute: received invalid route:', route);
        throw new Error('Invalid route response');
      }

      console.log('MapService.calculateHikingRoute: route calculated successfully:', {
        distance: route.distance,
        duration: route.duration,
        points: route.geometry.coordinates.length
      });

      return route;

    } catch (error) {
      console.error('MapService.calculateHikingRoute: error:', error);
      throw error;
    }
  },

  // Find best hiking route
  findBestHikingRoute(routes) {
    if (!routes || routes.length === 0) return null;
    
    // Sort routes by score
    const scoredRoutes = routes.map(route => ({
      route,
      score: this.calculateHikingScore(route)
    }));
    
    // Choose route with highest score
    return scoredRoutes.reduce((best, current) => 
      current.score > best.score ? current : best
    ).route;
  },

  // Calculate hiking score
  calculateHikingScore(route) {
    if (!route || !route.legs) return 0;
    
    let hikingPathCount = 0;
    let totalSteps = 0;
    
    route.legs.forEach(leg => {
      leg.steps.forEach(step => {
        totalSteps++;
        // Check if step is on a marked trail
        if (step.name?.includes('שביל') || 
            step.name?.includes('trail') || 
            step.maneuver?.modifier === 'straight') {
          hikingPathCount++;
        }
      });
    });
    
    // Calculate percentage of steps on marked trails
    return totalSteps > 0 ? (hikingPathCount / totalSteps) * 100 : 0;
  },

  // Update point details
  updatePointDetails(point, newDetails) {
    return {
      ...point,
      ...newDetails,
      coordinates: point.coordinates,
      id: point.id
    };
  },

  // Format coordinates
  formatCoordinates(coordinates) {
    if (!coordinates || coordinates.length !== 2) return '';
    
    const lat = coordinates[1].toFixed(6);
    const lon = coordinates[0].toFixed(6);
    
    return `${lat}°N, ${lon}°E`;
  },

  // Calculate distance
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Return in meters
  },

  // Calculate route
  async calculateRoute(startCoords, endCoords) {
    try {
      const route = await getMarkedTrailRoute(startCoords, endCoords);
      return route;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  },

  // Calculate route statistics
  calculateRouteStatistics(route) {
    if (!route || !route.properties) return null;

    return {
      distance: route.properties.distance || 0,
      duration: route.properties.duration || 0,
      elevation: {
        ascent: route.properties.ascent || 0,
        descent: route.properties.descent || 0
      }
    };
  },

  // Calculate total statistics
  calculateTotalStatistics(dailyRoutes) {
    if (!dailyRoutes || !dailyRoutes.length) return null;

    return dailyRoutes.reduce((total, day) => {
      if (!day.route || !day.route.properties) return total;

      return {
        totalDistance: total.totalDistance + (day.route.properties.distance || 0),
        totalDuration: total.totalDuration + (day.route.properties.duration || 0),
        totalElevation: {
          ascent: total.totalElevation.ascent + (day.route.properties.ascent || 0),
          descent: total.totalElevation.descent + (day.route.properties.descent || 0)
        }
      };
    }, {
      totalDistance: 0,
      totalDuration: 0,
      totalElevation: { ascent: 0, descent: 0 }
    });
  },

  // Normalize coordinates with improved validation
  normalizeCoordinates(coords) {
    if (!coords) {
      console.warn('normalizeCoordinates: received null or undefined coordinates');
      return null;
    }

    try {
      // אם זה מערך
      if (Array.isArray(coords)) {
        if (coords.length !== 2) {
          console.warn(`normalizeCoordinates: invalid array length ${coords.length}, expected 2`);
          return null;
        }

        const [first, second] = coords;
        
        // וידוא שהערכים הם מספרים
        if (typeof first !== 'number' || typeof second !== 'number') {
          console.warn('normalizeCoordinates: coordinates must be numbers');
          return null;
        }

        // בדיקה שהערכים הם בטווח תקין
        if (Math.abs(first) > 90 || Math.abs(second) > 180) {
          console.warn('normalizeCoordinates: coordinates out of valid range');
          return null;
        }

        // אם הערך הראשון הוא בטווח של קו אורך (longitude)
        if (Math.abs(first) > 90) {
          // נחזיר בפורמט [lat, lon]
          return [second, first];
        }

        // אחרת נניח שזה כבר בפורמט הנכון [lat, lon]
        return [first, second];
      }

      // אם זה אובייקט עם lat/lon
      if (coords.lat !== undefined && coords.lon !== undefined) {
        return [coords.lat, coords.lon];
      }

      // אם זה אובייקט עם latitude/longitude
      if (coords.latitude !== undefined && coords.longitude !== undefined) {
        return [coords.latitude, coords.longitude];
      }

      console.warn('normalizeCoordinates: unsupported coordinate format', coords);
      return null;
    } catch (error) {
      console.error('normalizeCoordinates: error processing coordinates', error);
      return null;
    }
  },

  // Check if coordinates are valid
  isValidCoordinates(coords) {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return false;
    }

    // הקואורדינטות מגיעות בפורמט [lon, lat]
    const [lon, lat] = coords;
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      !isNaN(lat) && !isNaN(lon) &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  },

  // Check if point is in Israel with improved bounds
  isPointInIsrael(coords) {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
      return false;
    }

    // הקואורדינטות מגיעות בפורמט [lon, lat]
    const [lon, lat] = coords;
    return (
      lat >= MAP_CONFIG.bounds[0][0] && 
      lat <= MAP_CONFIG.bounds[1][0] && 
      lon >= MAP_CONFIG.bounds[0][1] && 
      lon <= MAP_CONFIG.bounds[1][1]
    );
  },

  // Calculate distance between two points
  calculateDistanceBetweenPoints(coord1, coord2) {
    if (!coord1 || !coord2) return 0;
    
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
             Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Calculate walking time
  calculateWalkingTime(distanceKm) {
    const walkingSpeedKmH = 4; // Average walking speed in km/h
    return Math.round((distanceKm / walkingSpeedKmH) * 60);
  },

  // Calculate route details
  calculateRouteDetails(route) {
    if (!route) return null;

    const { distance, duration } = route;
    
    return {
      distanceKm: (distance / 1000).toFixed(1),
      durationHours: (duration / 3600).toFixed(1)
    };
  }
};

// Export functions
export const normalizeCoordinates = MapService.normalizeCoordinates;
export const isPointInIsrael = MapService.isPointInIsrael;
export const isValidCoordinates = MapService.isValidCoordinates;
export const calculateDistanceBetweenPoints = MapService.calculateDistanceBetweenPoints;
export const calculateWalkingTime = MapService.calculateWalkingTime;
export const calculateRouteDetails = MapService.calculateRouteDetails;
