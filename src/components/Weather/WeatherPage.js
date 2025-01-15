import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Paper, Grid, Autocomplete, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WeatherCard from './WeatherCard';
import { getLocationKey, getCurrentWeather, searchLocations, getHourlyForecast, getAirQuality, getForecast } from '../../services/WeatherService';

const WeatherPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // בקשת מיקום מהמשתמש בטעינת הדף
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Got coordinates:', position.coords.latitude, position.coords.longitude);
            const locationData = await getLocationKey(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('Location data:', locationData);
            setSelectedLocation(locationData);
          } catch (error) {
            console.error('Error getting current location:', error);
            setError('שגיאה בקבלת מיקום נוכחי');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('לא ניתן לקבל את המיקום הנוכחי');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (selectedLocation?.key) {
        setLoading(true);
        setError(null);
        try {
          console.log('Fetching weather data for location:', selectedLocation);
          const [weather, forecast] = await Promise.all([
            getCurrentWeather(selectedLocation.key),
            getForecast(selectedLocation.key)
          ]);
          console.log('Weather data:', weather);
          console.log('Forecast data:', forecast);
          setWeatherData({
            current: weather,
            forecast: forecast
          });
        } catch (error) {
          console.error('Error fetching weather data:', error);
          setError('שגיאה בטעינת נתוני מזג האוויר');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWeatherData();
  }, [selectedLocation]);

  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (value.length >= 2) {
      setSearchLoading(true);
      try {
        console.log('Searching for:', value);
        const locations = await searchLocations(value);
        console.log('Search results:', locations);
        setSearchResults(locations);
      } catch (error) {
        console.error('Error searching locations:', error);
        setError('שגיאה בחיפוש מיקום');
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (event, location) => {
    if (location) {
      setSelectedLocation(location);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box py={4}>
        {/* Search Bar */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Autocomplete
            fullWidth
            value={null}
            inputValue={searchQuery}
            onInputChange={(event, newValue) => handleSearch(newValue)}
            onChange={handleLocationSelect}
            options={searchResults}
            getOptionLabel={(option) => `${option.city}, ${option.region}, ${option.country}`}
            loading={searchLoading}
            noOptionsText="לא נמצאו תוצאות"
            loadingText="מחפש..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="חפש מיקום"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      <InputAdornment position="end">
                        <IconButton>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    </>
                  ),
                }}
              />
            )}
          />
        </Paper>

        {error && (
          <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {selectedLocation && (
          <>
            {/* Location Title */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Typography variant="h4">
                {selectedLocation.city}
                {selectedLocation.region && `, ${selectedLocation.region}`}
                {selectedLocation.country && ` • ${selectedLocation.country}`}
              </Typography>
            </Paper>

            {/* Current Weather */}
            {weatherData?.current && (
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>מזג אוויר נוכחי</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="h3">{weatherData.current.temperature.value}°{weatherData.current.temperature.unit}</Typography>
                      <Typography variant="h6">{weatherData.current.weatherText}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography>תחושה: {weatherData.current.temperature.feels_like}°{weatherData.current.temperature.unit}</Typography>
                      <Typography>לחות: {weatherData.current.humidity}%</Typography>
                      <Typography>רוח: {weatherData.current.windSpeed.value} {weatherData.current.windSpeed.unit} מכיוון {weatherData.current.windDirection}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* 5-Day Forecast */}
            {weatherData?.forecast && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>תחזית ל-5 ימים</Typography>
                <Grid container spacing={2}>
                  {weatherData.forecast.map((day, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}>
                      <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography>{new Date(day.date).toLocaleDateString('he-IL', { weekday: 'short' })}</Typography>
                        <Box sx={{ my: 2 }}>
                          <img src={day.day.icon} alt={day.day.iconPhrase} style={{ width: 50, height: 50 }} />
                        </Box>
                        <Typography variant="h6">{day.temperature.max}°/{day.temperature.min}°</Typography>
                        <Typography variant="body2">{day.day.iconPhrase}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default WeatherPage;
