import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  IconButton, 
  Typography, 
  CircularProgress, 
  Grid,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import OpenWeatherService from '../services/OpenWeatherService';

const WeatherPage = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [locationName, setLocationName] = useState('');

  const getAccurateLocation = () => {
    setIsLoadingLocation(true);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('הדפדפן שלך לא תומך באיתור מיקום'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true }
      );
    });
  };

  const updateLocation = async () => {
    try {
      const position = await getAccurateLocation();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setUserLocation(location);

      // קבלת מזג האוויר הנוכחי
      const current = await OpenWeatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      );
      setCurrentWeather(current);
      setLocationName(current.name);

      // קבלת תחזית
      const forecast = await OpenWeatherService.getForecast(
        location.latitude,
        location.longitude
      );
      setWeatherData(forecast);

    } catch (error) {
      console.error('שגיאה בעדכון המיקום:', error);
      setLocationError(error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <IconButton onClick={() => navigate('/')} color="primary">
            <HomeIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom>
            מזג אוויר
          </Typography>
          <IconButton onClick={updateLocation} color="primary" disabled={isLoadingLocation}>
            <MyLocationIcon />
          </IconButton>
        </Box>

        {isLoadingLocation ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : currentWeather && (
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, background: 'linear-gradient(to bottom, #f5f5f5, #fff)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  מזג אוויר ב{locationName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img 
                    src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                    alt={currentWeather.weather[0].description}
                    style={{ width: 64, height: 64 }}
                  />
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {Math.round(currentWeather.main.temp)}°
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {currentWeather.weather[0].description}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" gutterBottom>
                  משקעים: {currentWeather.rain ? `${currentWeather.rain['1h']}%` : '0%'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  לחות: {currentWeather.main.humidity}%
                </Typography>
                <Typography variant="body1">
                  רוח: {Math.round(currentWeather.wind.speed)} קמ"ש
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {weatherData && weatherData.list && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              תחזית ל-5 ימים הקרובים
            </Typography>
            <Grid container spacing={2}>
              {weatherData.list.map((day, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {new Date(day.dt * 1000).toLocaleDateString('he-IL', { weekday: 'short' })}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img
                          src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                          alt={day.weather[0].description}
                        />
                        <Typography variant="body2">
                          {day.weather[0].description}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {Math.round(day.main.temp_max)}°C / {Math.round(day.main.temp_min)}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        לחות: {day.main.humidity}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {locationError && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {locationError}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default WeatherPage;
