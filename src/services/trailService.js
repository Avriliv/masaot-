// src/services/trailService.js

// מערך של שבילים מסומנים בישראל
const MARKED_TRAILS = {
    שבילישראל: {
        id: 'INT',
        name: 'שביל ישראל',
        color: '#1e90ff',
        type: 'national',
        segments: [
            // דוגמא לקטע בשביל ישראל
            {
                id: 'INT-1',
                name: 'דן - הר כנען',
                startPoint: [33.2352, 35.6521],
                endPoint: [32.9871, 35.5126],
                length: 22.5,
                difficulty: 'בינונית',
                waterPoints: [
                    { name: 'תל דן', location: [33.2352, 35.6521] },
                    { name: 'דפנה', location: [33.2314, 35.6332] }
                ],
                campSites: [
                    { name: 'חניון לילה הר כנען', location: [32.9871, 35.5126] }
                ]
            }
        ]
    }
};

// נקודות מים מוכרות
const WATER_POINTS = [
    {
        id: 'W1',
        name: 'עין תינה',
        location: [33.2352, 35.6521],
        type: 'spring',
        reliable: true,
        lastVerified: '2024-01-15'
    }
];

// חניוני לילה
const CAMP_SITES = [
    {
        id: 'C1',
        name: 'חניון לילה הר מירון',
        location: [32.9871, 35.5126],
        facilities: ['water', 'bathroom', 'parking'],
        capacity: 50,
        requiresPermit: true
    }
];

// פונקציות שירות למציאת שבילים
const trailService = {
    // מציאת שבילים קרובים לנקודה
    findNearbyTrails: async (point, radius = 1) => {
        try {
            // בשלב ראשון נשתמש בנתונים מקומיים
            // בהמשך נתחבר ל-API של Israel Hiking Map
            return MARKED_TRAILS.filter(trail => {
                // מציאת שבילים במרחק מסוים מהנקודה
                return true; // כרגע מחזיר הכל
            });
        } catch (error) {
            console.error('שגיאה במציאת שבילים:', error);
            return [];
        }
    },

    // מציאת נקודות מים קרובות
    findWaterPoints: async (point, radius = 5) => {
        try {
            return WATER_POINTS.filter(waterPoint => {
                // חישוב מרחק מהנקודה
                return true; // כרגע מחזיר הכל
            });
        } catch (error) {
            console.error('שגיאה במציאת נקודות מים:', error);
            return [];
        }
    },

    // מציאת חניוני לילה קרובים
    findCampSites: async (point, radius = 5) => {
        try {
            return CAMP_SITES.filter(campSite => {
                // חישוב מרחק מהנקודה
                return true; // כרגע מחזיר הכל
            });
        } catch (error) {
            console.error('שגיאה במציאת חניונים:', error);
            return [];
        }
    },

    // חישוב מסלול בין נקודות על שבילים מסומנים
    calculateTrailRoute: async (points) => {
        try {
            // בהמשך נתחבר ל-API חיצוני לחישוב מסלול
            return {
                path: points,
                distance: 0,
                elevation: {
                    gain: 0,
                    loss: 0
                },
                estimatedTime: 0
            };
        } catch (error) {
            console.error('שגיאה בחישוב מסלול:', error);
            return null;
        }
    },

    // קבלת מידע על שביל ספציפי
    getTrailInfo: async (trailId) => {
        try {
            // בהמשך נתחבר ל-API לקבלת מידע מעודכן
            return MARKED_TRAILS[trailId] || null;
        } catch (error) {
            console.error('שגיאה בקבלת מידע על שביל:', error);
            return null;
        }
    }
};

export default trailService;