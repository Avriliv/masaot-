const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class OpenWeatherService {
  static async searchLocation(query) {
    try {
      const response = await fetch(
        `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}&lang=he`
      );
      
      if (!response.ok) {
        throw new Error('שגיאה בחיפוש מיקום');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('שגיאה בחיפוש מיקום:', error);
      throw error;
    }
  }

  static async getCurrentWeather(lat, lon) {
    try {
      // קבלת מזג אוויר נוכחי
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=he`
      );

      if (!weatherResponse.ok) {
        throw new Error('שגיאה בקבלת נתוני מזג אוויר');
      }

      const weatherData = await weatherResponse.json();

      try {
        // קבלת שם המקום בעברית
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData && geoData[0]) {
            const localNames = geoData[0].local_names;
            weatherData.name = localNames?.he || geoData[0].name;
          }
        }
      } catch (geoError) {
        console.warn('שגיאה בקבלת שם המקום:', geoError);
        // ממשיך גם אם יש שגיאה בקבלת שם המקום
      }

      return weatherData;
    } catch (error) {
      console.error('שגיאה בקבלת מזג אוויר נוכחי:', error);
      throw error;
    }
  }

  static async getForecast(lat, lon) {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=he`
      );
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת תחזית מזג אוויר');
      }
      
      const data = await response.json();
      
      // מיון וסינון התחזיות לפי ימים
      const dailyForecasts = {};
      
      data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const hour = date.getHours();
        
        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = {
            dt: forecast.dt,
            date: date,
            main: {
              temp_max: -Infinity,
              temp_min: Infinity,
              humidity: forecast.main.humidity
            },
            weather: forecast.weather,
            wind: forecast.wind,
            dayName: new Intl.DateTimeFormat('he', { weekday: 'long' }).format(date)
          };
        }

        // עדכון טמפרטורות מקסימום ומינימום
        dailyForecasts[dateKey].main.temp_max = Math.max(
          dailyForecasts[dateKey].main.temp_max,
          forecast.main.temp_max
        );
        dailyForecasts[dateKey].main.temp_min = Math.min(
          dailyForecasts[dateKey].main.temp_min,
          forecast.main.temp_min
        );

        // בחירת תיאור מזג האוויר המייצג ביותר (בדרך כלל מאמצע היום)
        if (hour >= 11 && hour <= 14) {
          dailyForecasts[dateKey].weather = forecast.weather;
        }
      });

      // ממיין את התחזיות לפי תאריך ולוקח רק את 5 הימים הבאים
      const sortedForecasts = Object.values(dailyForecasts)
        .sort((a, b) => a.date - b.date)
        .slice(0, 5)
        .map(forecast => ({
          ...forecast,
          dt: forecast.dt,
          main: forecast.main,
          weather: forecast.weather,
          wind: forecast.wind,
          dayName: forecast.dayName
        }));

      return {
        list: sortedForecasts
      };
    } catch (error) {
      console.error('שגיאה בשירות מזג האוויר:', error);
      throw error;
    }
  }

  // קבלת שם המיקום בעברית
  static async getLocationName(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת שם המיקום');
      }

      const data = await response.json();
      if (data && data[0]) {
        const localNames = data[0].local_names;
        return localNames?.he || data[0].name;
      }
      return '';
    } catch (error) {
      console.error('שגיאה בקבלת שם המיקום:', error);
      throw error;
    }
  }
}

export default OpenWeatherService;
