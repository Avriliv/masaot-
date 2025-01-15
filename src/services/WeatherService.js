import axios from 'axios';

const API_KEY = '1JnLqTih3SLIQ3JsVdDGtcVW1QDsvHeB';  // API key חדש
const BASE_URL = '/accuweather';  // שימוש בפרוקסי

// Cache object
const cache = {
  locations: new Map(),
  weather: new Map(),
  forecasts: new Map(),
  airQuality: new Map()
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  locations: 24 * 60 * 60 * 1000,  // 24 hours
  weather: 30 * 60 * 1000,         // 30 minutes
  forecasts: 60 * 60 * 1000,       // 1 hour
  airQuality: 60 * 60 * 1000       // 1 hour
};

// Cache helper functions
function getCacheKey(type, key) {
  return `${type}:${key}`;
}

function getFromCache(type, key) {
  const cacheKey = getCacheKey(type, key);
  const cached = cache[type].get(cacheKey);
  
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_EXPIRATION[type]) {
    cache[type].delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setInCache(type, key, data) {
  const cacheKey = getCacheKey(type, key);
  cache[type].set(cacheKey, {
    timestamp: Date.now(),
    data
  });
}

// המרת כיוון רוח למעלות לטקסט בעברית
function getWindDirection(degrees) {
  const directions = ['צפון', 'צפון-מזרח', 'מזרח', 'דרום-מזרח', 'דרום', 'דרום-מערב', 'מערב', 'צפון-מערב'];
  return directions[Math.round(degrees / 45) % 8];
}

// פונקציה לקבלת מפתח מיקום לפי קואורדינטות
async function getLocationKey(lat, lon) {
  try {
    const cacheKey = `${lat},${lon}`;
    const cachedLocation = getFromCache('locations', cacheKey);
    if (cachedLocation) {
      console.log('Returning cached location data');
      return cachedLocation;
    }

    console.log(`Fetching location key for coordinates: ${lat},${lon}`);
    const url = `${BASE_URL}/locations/v1/cities/geoposition/search`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        q: `${lat},${lon}`,
        language: 'he',
        details: true
      }
    });
    
    console.log('Location API response data:', response.data);
    
    if (!response.data || !response.data.Key) {
      console.error('Invalid response format - missing Key:', response.data);
      throw new Error('תגובה לא תקינה מהשרת');
    }
    
    const locationData = {
      key: response.data.Key,
      city: response.data.LocalizedName,
      country: response.data.Country.LocalizedName,
      region: response.data.AdministrativeArea.LocalizedName
    };

    setInCache('locations', cacheKey, locationData);
    return locationData;
  } catch (error) {
    console.error('Error getting location key:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('שגיאה בקבלת מפתח מיקום');
  }
}

// פונקציה לחיפוש מיקומים
async function searchLocations(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const cachedResults = getFromCache('locations', query);
    if (cachedResults) {
      console.log('Returning cached search results');
      return cachedResults;
    }

    console.log('Searching with query:', query);
    const url = `${BASE_URL}/locations/v1/cities/search`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        q: query,
        language: 'he',
        details: true
      }
    });

    console.log('Search API response:', response.data);

    const results = response.data.map(location => ({
      key: location.Key,
      city: location.LocalizedName,
      country: location.Country.LocalizedName,
      region: location.AdministrativeArea.LocalizedName
    }));

    setInCache('locations', query, results);
    return results;
  } catch (error) {
    console.error('Error searching locations:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    return [];
  }
}

// פונקציה לקבלת מזג אוויר נוכחי
async function getCurrentWeather(locationKey) {
  try {
    const cachedWeather = getFromCache('weather', locationKey);
    if (cachedWeather) {
      console.log('Returning cached weather data');
      return cachedWeather;
    }

    console.log(`Fetching current weather for location key: ${locationKey}`);
    
    const currentUrl = `${BASE_URL}/currentconditions/v1/${locationKey}`;
    const forecastUrl = `${BASE_URL}/forecasts/v1/daily/1day/${locationKey}`;
    
    console.log('Current conditions URL:', currentUrl);
    console.log('Forecast URL:', forecastUrl);
    
    const [currentResponse, dailyResponse] = await Promise.all([
      axios.get(currentUrl, {
        params: {
          apikey: API_KEY,
          language: 'he',
          details: true
        }
      }),
      axios.get(forecastUrl, {
        params: {
          apikey: API_KEY,
          language: 'he',
          details: true,
          metric: true
        }
      })
    ]);

    console.log('Current conditions response:', currentResponse.data);
    console.log('Daily forecast response:', dailyResponse.data);

    const current = currentResponse.data[0];
    const daily = dailyResponse.data;

    const weatherData = {
      temperature: {
        value: Math.round(current.Temperature.Metric.Value),
        feels_like: Math.round(current.RealFeelTemperature.Metric.Value),
        unit: 'C'
      },
      humidity: current.RelativeHumidity,
      windSpeed: {
        value: Math.round(current.Wind.Speed.Metric.Value),
        unit: 'קמ"ש'
      },
      windDirection: getWindDirection(current.Wind.Direction.Degrees),
      pressure: current.Pressure.Metric.Value,
      visibility: Math.round(current.Visibility.Metric.Value),
      weatherText: current.WeatherText,
      icon: `https://www.accuweather.com/images/weathericons/${current.WeatherIcon}.svg`,
      sunrise: daily.DailyForecasts[0].Sun.Rise,
      sunset: daily.DailyForecasts[0].Sun.Set
    };

    setInCache('weather', locationKey, weatherData);
    return weatherData;
  } catch (error) {
    console.error('Error getting current weather:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('שגיאה בקבלת מזג אוויר נוכחי');
  }
}

// פונקציה לקבלת תחזית שעתית
async function getHourlyForecast(locationKey) {
  try {
    const cachedForecast = getFromCache('forecasts', `hourly:${locationKey}`);
    if (cachedForecast) {
      console.log('Returning cached hourly forecast');
      return cachedForecast;
    }

    console.log(`Fetching hourly forecast for location key: ${locationKey}`);
    const url = `${BASE_URL}/forecasts/v1/hourly/12hour/${locationKey}`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        language: 'he',
        metric: true,
        details: true
      }
    });

    console.log('Hourly forecast response:', response.data);

    const forecast = response.data.map(hour => ({
      time: new Date(hour.DateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(hour.Temperature.Value),
      icon: `https://www.accuweather.com/images/weathericons/${hour.WeatherIcon}.svg`,
      description: hour.IconPhrase,
      precipitation: hour.PrecipitationProbability
    }));

    setInCache('forecasts', `hourly:${locationKey}`, forecast);
    return forecast;
  } catch (error) {
    console.error('Error getting hourly forecast:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('שגיאה בקבלת תחזית שעתית');
  }
}

// פונקציה לקבלת תחזית ל-5 ימים
async function getForecast(locationKey) {
  try {
    const cachedForecast = getFromCache('forecasts', `daily:${locationKey}`);
    if (cachedForecast) {
      console.log('Returning cached daily forecast');
      return cachedForecast;
    }

    console.log(`Fetching 5-day forecast for location key: ${locationKey}`);
    const url = `${BASE_URL}/forecasts/v1/daily/5day/${locationKey}`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        language: 'he',
        metric: true,
        details: true
      }
    });

    console.log('5-day forecast response:', response.data);

    const forecast = response.data.DailyForecasts.map(day => ({
      date: day.Date,
      temperature: {
        max: Math.round(day.Temperature.Maximum.Value),
        min: Math.round(day.Temperature.Minimum.Value)
      },
      day: {
        icon: `https://www.accuweather.com/images/weathericons/${day.Day.Icon}.svg`,
        iconPhrase: day.Day.IconPhrase
      }
    }));

    setInCache('forecasts', `daily:${locationKey}`, forecast);
    return forecast;
  } catch (error) {
    console.error('Error getting forecast:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('שגיאה בקבלת תחזית');
  }
}

// פונקציה לקבלת איכות אוויר
async function getAirQuality(locationKey) {
  try {
    const cachedAirQuality = getFromCache('airQuality', locationKey);
    if (cachedAirQuality) {
      console.log('Returning cached air quality data');
      return cachedAirQuality;
    }

    console.log(`Fetching air quality for location key: ${locationKey}`);
    const url = `${BASE_URL}/airquality/v1/currentconditions/${locationKey}`;
    console.log('Request URL:', url);
    
    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        details: true
      }
    });

    console.log('Air quality response:', response.data);

    const data = response.data[0];
    let quality;
    
    switch(data.Category) {
      case 'Good':
        quality = 'טובה';
        break;
      case 'Moderate':
        quality = 'בינונית';
        break;
      case 'UnhealthyForSensitive':
        quality = 'לא בריאה לרגישים';
        break;
      case 'Unhealthy':
        quality = 'לא בריאה';
        break;
      case 'VeryUnhealthy':
        quality = 'מאוד לא בריאה';
        break;
      case 'Hazardous':
        quality = 'מסוכנת';
        break;
      default:
        quality = 'לא ידוע';
    }

    const airQualityData = {
      quality,
      components: {
        co: Math.round(data.CO?.Concentration || 0),
        no2: Math.round(data.NO2?.Concentration || 0),
        o3: Math.round(data.O3?.Concentration || 0),
        pm10: Math.round(data.PM10?.Concentration || 0)
      }
    };

    setInCache('airQuality', locationKey, airQualityData);
    return airQualityData;
  } catch (error) {
    console.error('Error getting air quality:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw new Error('שגיאה בקבלת נתוני איכות אוויר');
  }
}

export {
  getLocationKey,
  getCurrentWeather,
  getHourlyForecast,
  getForecast,
  getAirQuality,
  searchLocations
};
