// השירות המטאורולוגי הישראלי API
const IMS_API_KEY = process.env.REACT_APP_IMS_API_KEY;
const BASE_URL = 'https://api.ims.gov.il/v1';

class IMSWeatherService {
  static async getStationIdByLocation(lat, lon) {
    try {
      const response = await fetch(`${BASE_URL}/stations/near/${lat}/${lon}`, {
        headers: {
          'Authorization': `ApiToken ${IMS_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת תחנה מטאורולוגית');
      }

      const data = await response.json();
      return data[0]?.stationId; // מחזיר את התחנה הקרובה ביותר
    } catch (error) {
      console.error('שגיאה בקבלת תחנה:', error);
      throw error;
    }
  }

  static async getCurrentWeather(stationId) {
    try {
      const response = await fetch(`${BASE_URL}/stations/${stationId}/latest`, {
        headers: {
          'Authorization': `ApiToken ${IMS_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת נתוני מזג אוויר');
      }

      const data = await response.json();
      return this.formatWeatherData(data);
    } catch (error) {
      console.error('שגיאה בקבלת מזג אוויר:', error);
      throw error;
    }
  }

  static async getForecast(lat, lon) {
    try {
      const response = await fetch(`${BASE_URL}/forecast/daily/${lat},${lon}`, {
        headers: {
          'Authorization': `ApiToken ${IMS_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת תחזית');
      }

      const data = await response.json();
      return this.formatForecastData(data);
    } catch (error) {
      console.error('שגיאה בקבלת תחזית:', error);
      throw error;
    }
  }

  static formatWeatherData(data) {
    return {
      main: {
        temp: data.temperature,
        humidity: data.relativeHumidity,
        pressure: data.pressure
      },
      wind: {
        speed: data.windSpeed,
        deg: data.windDirection
      },
      weather: [{
        description: this.getWeatherDescription(data)
      }]
    };
  }

  static formatForecastData(data) {
    return {
      list: data.forecastDays.map(day => ({
        dt: new Date(day.date).getTime() / 1000,
        main: {
          temp_min: day.minimumTemperature,
          temp_max: day.maximumTemperature,
          humidity: day.relativeHumidity
        },
        weather: [{
          description: this.getWeatherDescription(day)
        }]
      }))
    };
  }

  static getWeatherDescription(data) {
    // המרה של קודי מזג אוויר של השירות המטאורולוגי לתיאורים
    // זה צריך להיות מותאם לפי הקודים הספציפיים של השירות
    return 'בהיר'; // ברירת מחדל
  }
}

export default IMSWeatherService;
