import api from './api';

// שירות לחיפוש מיקומים
const LocationSearchService = {
  // חיפוש מיקומים
  search: async (query) => {
    if (!query?.trim()) return [];
    
    try {
      const response = await api.get('/locations/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('שגיאה בחיפוש מיקומים:', error);
      throw new Error('שגיאה בחיפוש מיקומים. אנא נסה שנית.');
    }
  },

  // המרת קואורדינטות לכתובת
  reverseGeocode: async (coordinates) => {
    if (!coordinates || coordinates.length !== 2) {
      throw new Error('קואורדינטות לא תקינות');
    }
    
    try {
      const response = await api.get('/locations/reverse', {
        params: {
          lat: coordinates[1],
          lon: coordinates[0]
        }
      });
      return response.data;
    } catch (error) {
      console.error('שגיאה בהמרת קואורדינטות לכתובת:', error);
      throw new Error('שגיאה בהמרת קואורדינטות לכתובת. אנא נסה שנית.');
    }
  }
};

export default LocationSearchService;
