import { getMarkedTrailRoute } from './LocalOSRMService';

// Map configuration
export const MAP_CONFIG = {
    center: [31.5, 35.0], // מרכז ישראל
    zoom: 7, // הקטנת הזום מ-8 ל-7
    bounds: {
        north: 33.4, // הקטנת הגבול הצפוני
        south: 29.8, // העלאת הגבול הדרומי
        east: 35.9,  // השארת הגבול המזרחי
        west: 34.2   // השארת הגבול המערבי
    },
    layers: {
        base: {
            osm: {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '© OpenStreetMap contributors'
            },
            hiking: {
                url: 'https://israelhiking.osm.org.il/Hebrew/Tiles/{z}/{x}/{y}.png',
                attribution: '© Israel Hiking'
            }
        }
    },
    osrmConfig: {
        localUrl: '/osrm',
        profile: 'foot',
        options: {
            geometries: 'polyline',
            overview: 'full',
            alternatives: false,
            steps: true,
            annotations: true,
            continue_straight: true,
            radiuses: '50'
        }
    }
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
    calculateHikingRoute: async (startCoords, endCoords, waypoints = []) => {
        try {
            const route = await getMarkedTrailRoute(startCoords, endCoords, waypoints);
            return {
                ...route,
                properties: {
                    ...route.properties,
                    isMarkedTrail: true
                }
            };
        } catch (error) {
            console.error('Error calculating hiking route:', error);
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
    }
};
