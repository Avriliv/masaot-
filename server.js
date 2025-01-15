const express = require('express');
const cors = require('cors');
const axios = require('axios');  
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ACCUWEATHER_API_KEY = '1JnLqTih3SLIQ3JsVdDGtcVW1QDsvHeB';
const BASE_URL = 'https://dataservice.accuweather.com';

// Proxy for location search
app.get('/api/locations/search', async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    let url = '';
    let params = { apikey: ACCUWEATHER_API_KEY, language: 'he' };

    if (lat && lon) {
      url = `${BASE_URL}/locations/v1/cities/geoposition/search`;
      params.q = `${lat},${lon}`;
    } else if (q) {
      url = `${BASE_URL}/locations/v1/cities/autocomplete`;
      params.q = q;
    }

    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying location request:', error);
    res.status(500).json({ error: 'Error fetching location data' });
  }
});

// Proxy for current conditions
app.get('/api/currentconditions/:locationKey', async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/currentconditions/v1/${req.params.locationKey}`,
      {
        params: {
          apikey: ACCUWEATHER_API_KEY,
          language: 'he',
          details: true
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying current conditions request:', error);
    res.status(500).json({ error: 'Error fetching current conditions' });
  }
});

// Proxy for forecast
app.get('/api/forecast/:locationKey', async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/forecasts/v1/daily/5day/${req.params.locationKey}`,
      {
        params: {
          apikey: ACCUWEATHER_API_KEY,
          language: 'he',
          metric: true
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying forecast request:', error);
    res.status(500).json({ error: 'Error fetching forecast data' });
  }
});

// Weather API routes
app.get('/api/weather/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.weatherapi.com/v1/${path}?${queryString}`;
    console.log('Requesting:', url); // For debugging
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
