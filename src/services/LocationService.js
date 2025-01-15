import api from './api';

// שירות לטיפול במיקומים
const LocationService = {
  // חיפוש מקומות באמצעות השרת המקומי
  searchPlaces: async (query, type = 'all') => {
    if (!query?.trim()) return [];
    
    try {
      const response = await api.get('/locations/search', {
        params: {
          query,
          type,
          limit: 10
        }
      });
      
      return response.data.map(place => ({
        id: place.id,
        name: place.name,
        address: place.address,
        coordinates: place.coordinates,
        type: place.type,
        properties: place.properties
      }));
    } catch (error) {
      console.error('שגיאה בחיפוש מקומות:', error);
      throw new Error('שגיאה בחיפוש מקומות. אנא נסה שנית.');
    }
  },

  // חיפוש שבילים באזור מסוים
  searchTrailsInArea: async (bounds) => {
    try {
      const response = await api.get('/locations/trails', {
        params: {
          bounds,
          limit: 50
        }
      });

      return response.data;
    } catch (error) {
      console.error('שגיאה בחיפוש שבילים:', error);
      throw new Error('שגיאה בחיפוש שבילים. אנא נסה שנית.');
    }
  },

  // המרת מיקום לכתובת
  reverseGeocode: async (latitude, longitude) => {
    try {
      const response = await api.get('/locations/reverse', {
        params: {
          lat: latitude,
          lon: longitude
        }
      });

      return response.data;
    } catch (error) {
      console.error('שגיאה בהמרת מיקום לכתובת:', error);
      throw new Error('שגיאה בהמרת מיקום לכתובת. אנא נסה שנית.');
    }
  },

  // קבלת מיקום נוכחי
  getCurrentLocation: async (onStatusUpdate = () => {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        onStatusUpdate('שירותי המיקום אינם נתמכים בדפדפן זה');
        reject(new Error('שירותי המיקום אינם נתמכים בדפדפן זה'));
        return;
      }

      onStatusUpdate('מאתר את מיקומך...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const locationDetails = await LocationService.reverseGeocode(latitude, longitude);
            
            resolve({
              coordinates: [longitude, latitude],
              ...locationDetails
            });
          } catch (error) {
            console.error('שגיאה בקבלת פרטי מיקום:', error);
            reject(new Error('שגיאה בקבלת פרטי מיקום'));
          }
        },
        (error) => {
          let errorMessage = 'שגיאה בקבלת המיקום';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'המשתמש לא אישר גישה לשירותי המיקום';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'מידע המיקום אינו זמין';
              break;
            case error.TIMEOUT:
              errorMessage = 'פג הזמן הקצוב לקבלת המיקום';
              break;
          }
          onStatusUpdate(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  // חישוב מרחק בין שתי נקודות (בקילומטרים)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // רדיוס כדור הארץ בקילומטרים
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

export default LocationService;
