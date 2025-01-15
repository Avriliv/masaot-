import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    WbSunny as SunIcon,
    Cloud as CloudIcon,
    Opacity as RainIcon,
    AcUnit as SnowIcon,
    Thunderstorm as StormIcon,
    Air as WindIcon
} from '@mui/icons-material';

const API_KEY = 'YOUR_API_KEY'; // נצטרך להחליף את זה במפתח אמיתי
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const WeatherForecast = ({ coordinates, date }) => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getWeatherIcon = (weatherCode) => {
        if (weatherCode >= 200 && weatherCode < 300) return <StormIcon />;
        if (weatherCode >= 300 && weatherCode < 600) return <RainIcon />;
        if (weatherCode >= 600 && weatherCode < 700) return <SnowIcon />;
        if (weatherCode >= 700 && weatherCode < 800) return <WindIcon />;
        if (weatherCode === 800) return <SunIcon />;
        return <CloudIcon />;
    };

    const fetchWeatherData = async () => {
        if (!coordinates || !coordinates.lat || !coordinates.lng) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${API_KEY}&units=metric&lang=he`
            );

            if (!response.ok) {
                throw new Error('שגיאה בטעינת נתוני מזג האוויר');
            }

            const data = await response.json();
            
            // מסנן את התחזית לפי התאריך שנבחר
            const filteredForecast = data.list.filter(item => {
                const forecastDate = new Date(item.dt * 1000).toLocaleDateString();
                return forecastDate === new Date(date).toLocaleDateString();
            });

            setForecast(filteredForecast);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (coordinates && date) {
            fetchWeatherData();
        }
    }, [coordinates, date]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!forecast || forecast.length === 0) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                אין תחזית זמינה לתאריך זה
            </Alert>
        );
    }

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                תחזית מזג אוויר
            </Typography>
            <Grid container spacing={2}>
                {forecast.map((item, index) => {
                    const time = new Date(item.dt * 1000).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle1">
                                        {time}
                                    </Typography>
                                    {getWeatherIcon(item.weather[0].id)}
                                </Box>
                                <Typography variant="h4" sx={{ my: 1 }}>
                                    {Math.round(item.main.temp)}°C
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {item.weather[0].description}
                                </Typography>
                                <Box mt={1}>
                                    <Typography variant="body2">
                                        לחות: {item.main.humidity}%
                                    </Typography>
                                    <Typography variant="body2">
                                        רוח: {Math.round(item.wind.speed)} קמ"ש
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
};

export default WeatherForecast;
