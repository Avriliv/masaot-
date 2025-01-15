import axios from 'axios';

// קונפיגורציה של ה-backend
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
  },
  production: {
    baseURL: 'https://api.masaot.com/api', // נצטרך לעדכן כשנעלה לפרודקשן
  }
};

// בחירת הקונפיגורציה המתאימה לפי הסביבה
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

// יצירת מופע axios עם הקונפיגורציה
const api = axios.create({
  baseURL: config.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor להוספת טוקן אוטנטיקציה
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // שגיאת שרת
      switch (error.response.status) {
        case 401:
          // טיפול בשגיאת אוטנטיקציה
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // טיפול בשגיאת הרשאות
          break;
        case 500:
          // טיפול בשגיאת שרת
          break;
        default:
          break;
      }
    } else if (error.request) {
      // שגיאת רשת
      console.error('Network Error:', error.request);
    } else {
      // שגיאה אחרת
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
