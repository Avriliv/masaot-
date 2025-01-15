// src/services/tripService.js

// מבנה בסיסי של טיול
const tripTemplate = {
    basicInfo: {
        id: null,
        name: '',
        startDate: null,
        endDate: null,
        type: '', // יומי, לילה, מספר ימים
        organization: '',
        participantsCount: 0,
        ageGroup: '',
        hasSpecialNeeds: false
    },
    route: {
        points: [], // נקודות במסלול
        trails: [], // שבילים מסומנים
        totalDistance: 0,
        elevationGain: 0,
        elevationLoss: 0,
        estimatedDuration: 0,
        stops: [], // נקודות עצירה
        campSites: [] // חניוני לילה
    },
    logistics: {
        equipment: {
            group: [], // ציוד קבוצתי
            personal: [] // ציוד אישי
        },
        water: {
            totalNeeded: 0,
            sources: [] // נקודות מים
        },
        food: {
            meals: [],
            specialDiets: []
        },
        transportation: {
            type: '',
            details: '',
            pickupPoint: null,
            dropoffPoint: null
        }
    },
    safety: {
        requiredStaff: {
            guides: 0,
            medics: 0,
            guards: 0
        },
        permissions: [],
        emergencyContacts: [],
        emergencyRoutes: [],
        weatherAlerts: []
    }
};

const tripService = {
    // יצירת טיול חדש
    createNewTrip: () => {
        return {
            ...tripTemplate,
            basicInfo: {
                ...tripTemplate.basicInfo,
                id: Date.now()
            }
        };
    },

    // חישוב דרישות בטיחות
    calculateSafetyRequirements: (participantsCount, tripType, hasSpecialNeeds) => {
        return {
            guides: Math.ceil(participantsCount / 15),
            medics: Math.ceil(participantsCount / 50),
            guards: Math.ceil(participantsCount / 50)
        };
    },

    // חישוב כמות מים נדרשת
    calculateWaterRequirements: (participantsCount, distance, weather) => {
        const baseWaterPerPerson = 3; // ליטר ליום
        const weatherFactor = weather === 'hot' ? 1.5 : 1;
        const distanceFactor = Math.ceil(distance / 10); // תוספת ליטר לכל 10 ק"מ

        return participantsCount * (baseWaterPerPerson + distanceFactor) * weatherFactor;
    },

    // בדיקת תוקף אישורים
    validatePermissions: (permissions) => {
        const required = [
            'אישור ביטחוני',
            'אישור בטיחותי',
            'אישורי הורים',
            'ביטוח'
        ];

        return required.every(req => permissions.includes(req));
    },

    // שמירת טיול
    saveTrip: async (trip) => {
        try {
            // בהמשך נשמור בשרת
            localStorage.setItem(`trip_${trip.basicInfo.id}`, JSON.stringify(trip));
            return true;
        } catch (error) {
            console.error('שגיאה בשמירת הטיול:', error);
            return false;
        }
    },

    // טעינת טיול
    loadTrip: async (tripId) => {
        try {
            const trip = localStorage.getItem(`trip_${tripId}`);
            return trip ? JSON.parse(trip) : null;
        } catch (error) {
            console.error('שגיאה בטעינת הטיול:', error);
            return null;
        }
    },

    // קבלת רשימת טיולים
    getAllTrips: async () => {
        try {
            const trips = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('trip_')) {
                    const trip = JSON.parse(localStorage.getItem(key));
                    trips.push(trip);
                }
            }
            return trips;
        } catch (error) {
            console.error('שגיאה בטעינת הטיולים:', error);
            return [];
        }
    },

    // חישוב עלויות
    calculateCosts: (trip) => {
        // לוגיקה לחישוב עלויות
        return {
            transportation: 0,
            equipment: 0,
            food: 0,
            staff: 0,
            other: 0,
            total: 0
        };
    },

    // יצוא דוח טיול
    exportTripReport: (trip) => {
        // יצירת דוח מפורט
        return {
            basicInfo: trip.basicInfo,
            route: {
                distance: trip.route.totalDistance,
                duration: trip.route.estimatedDuration,
                stops: trip.route.stops.length
            },
            safety: {
                staff: trip.safety.requiredStaff,
                permissions: trip.safety.permissions
            },
            logistics: {
                water: trip.logistics.water.totalNeeded,
                equipment: trip.logistics.equipment
            }
        };
    },

    // פונקציות חדשות לתמיכה בפיצ'רים המורחבים

    // עדכון סטטוס טיול
    updateTripStatus(tripId, newStatus) {
        try {
            // TODO: Implement status update logic
            return { success: true };
        } catch (error) {
            console.error('Error updating trip status:', error);
            return { success: false, error };
        }
    },

    // קבלת סטטיסטיקות טיולים
    getTripStatistics() {
        try {
            const trips = this.getAllTrips();
            return {
                totalTrips: trips.length,
                averageCost: trips.reduce((acc, trip) => acc + trip.basicInfo.cost, 0) / trips.length,
                upcomingTrips: trips.filter(trip => new Date(trip.basicInfo.startDate) > new Date()).length,
                completedTrips: trips.filter(trip => trip.status === 'completed').length,
                totalParticipants: trips.reduce((acc, trip) => acc + trip.basicInfo.participantsCount, 0)
            };
        } catch (error) {
            console.error('Error getting trip statistics:', error);
            return null;
        }
    },

    // חיפוש טיולים
    searchTrips(query, filters = {}) {
        try {
            let trips = this.getAllTrips();
            
            // פילטור לפי טקסט חופשי
            if (query) {
                const searchTerm = query.toLowerCase();
                trips = trips.filter(trip => 
                    trip.basicInfo.name.toLowerCase().includes(searchTerm) ||
                    trip.basicInfo.organization.toLowerCase().includes(searchTerm) ||
                    trip.route.trails.some(trail => trail.name.toLowerCase().includes(searchTerm))
                );
            }

            // פילטור לפי סטטוס
            if (filters.status) {
                trips = trips.filter(trip => trip.status === filters.status);
            }

            // פילטור לפי תאריך
            if (filters.startDate) {
                trips = trips.filter(trip => new Date(trip.basicInfo.startDate) >= new Date(filters.startDate));
            }
            if (filters.endDate) {
                trips = trips.filter(trip => new Date(trip.basicInfo.endDate) <= new Date(filters.endDate));
            }

            // מיון
            if (filters.sortBy) {
                trips.sort((a, b) => {
                    switch (filters.sortBy) {
                        case 'date':
                            return new Date(b.basicInfo.startDate) - new Date(a.basicInfo.startDate);
                        case 'name':
                            return a.basicInfo.name.localeCompare(b.basicInfo.name);
                        case 'participants':
                            return b.basicInfo.participantsCount - a.basicInfo.participantsCount;
                        default:
                            return 0;
                    }
                });
            }

            return trips;
        } catch (error) {
            console.error('Error searching trips:', error);
            return [];
        }
    },

    // יצירת העתק של טיול קיים
    duplicateTrip(tripId) {
        try {
            const originalTrip = this.loadTrip(tripId);
            if (!originalTrip) {
                throw new Error('Trip not found');
            }

            const newTrip = {
                ...originalTrip,
                basicInfo: {
                    ...originalTrip.basicInfo,
                    id: null, // יצירת ID חדש
                    name: `העתק של ${originalTrip.basicInfo.name}`,
                    startDate: null,
                    endDate: null
                },
                status: 'draft'
            };

            return this.saveTrip(newTrip);
        } catch (error) {
            console.error('Error duplicating trip:', error);
            return null;
        }
    },

    // קבלת תחזית מזג אוויר לטיול
    async getWeatherForecast(tripId) {
        try {
            const trip = this.loadTrip(tripId);
            if (!trip || !trip.route.points.length) {
                throw new Error('Trip or route points not found');
            }

            // נקודה מרכזית במסלול לתחזית
            const centerPoint = trip.route.points[Math.floor(trip.route.points.length / 2)];
            
            // TODO: Implement weather API call
            const forecast = {
                daily: [
                    {
                        date: trip.basicInfo.startDate,
                        tempMax: 25,
                        tempMin: 15,
                        humidity: 65,
                        precipitation: 0,
                        description: 'בהיר'
                    }
                    // ... יותר ימים
                ]
            };

            return forecast;
        } catch (error) {
            console.error('Error getting weather forecast:', error);
            return null;
        }
    }
};

export default tripService;