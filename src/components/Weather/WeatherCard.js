import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { WbSunny as SunIcon, Opacity as HumidityIcon, Air as WindIcon } from '@mui/icons-material';
import { WiHumidity, WiStrongWind, WiBarometer, WiSunrise, WiSunset } from 'react-icons/wi';

const WeatherCard = ({ weatherData, hourlyData, airQuality }) => {
  if (!weatherData) return null;

  // פונקציה להמרת תאריך למחרוזת בעברית
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('he-IL', options);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        transition: 'transform 0.2s ease-in-out',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {formatDate(new Date())}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 2,
          mt: 2
        }}>
          <img 
            src={weatherData.icon} 
            alt={weatherData.weatherText}
            style={{ width: '64px', height: '64px' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {weatherData.temperature.value}°{weatherData.temperature.unit}
          </Typography>
        </Box>

        <Typography variant="body1" gutterBottom sx={{ 
          textAlign: 'center',
          color: 'text.secondary',
          minHeight: '48px'
        }}>
          {weatherData.weatherText}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            justifyContent: 'center'
          }}>
            <WiHumidity size={24} color="#1976d2" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              לחות: {weatherData.humidity}%
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <WiStrongWind size={24} color="#1976d2" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              רוח: {weatherData.windSpeed.value} {weatherData.windSpeed.unit}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
