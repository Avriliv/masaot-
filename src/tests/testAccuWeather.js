const axios = require('axios');

const API_KEY = '1JnLqTih3SLIQ3JsVdDGtcVW1QDsvHeB';  // API key חדש
const TEST_LOCATION = 'Tel Aviv';

async function testAccuWeatherAPI() {
    try {
        console.log('Testing AccuWeather API...');
        
        // Test 1: Location Search with additional headers
        console.log('\nTest 1: Location Search');
        const searchUrl = `https://dataservice.accuweather.com/locations/v1/cities/search`;
        const searchResponse = await axios.get(searchUrl, {
            params: {
                apikey: API_KEY,
                q: TEST_LOCATION,
                language: 'he',
                details: true
            },
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'Accept-Language': 'he',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        console.log('Search Response Status:', searchResponse.status);
        console.log('Search Response Data:', JSON.stringify(searchResponse.data, null, 2));
        
        if (searchResponse.data && searchResponse.data.length > 0) {
            const locationKey = searchResponse.data[0].Key;
            console.log('Location Key:', locationKey);
            
            // Test 2: Current Conditions
            console.log('\nTest 2: Current Conditions');
            const conditionsUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}`;
            const conditionsResponse = await axios.get(conditionsUrl, {
                params: {
                    apikey: API_KEY,
                    language: 'he',
                    details: true
                },
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'Accept-Language': 'he',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            console.log('Conditions Response Status:', conditionsResponse.status);
            console.log('Conditions Response Data:', JSON.stringify(conditionsResponse.data, null, 2));
        }
        
        console.log('\nAll tests completed successfully!');
        
    } catch (error) {
        console.error('\nError testing AccuWeather API:');
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
            console.error('Response Headers:', error.response.headers);
            
            // Log the full URL that was used
            if (error.config) {
                console.error('Full URL:', error.config.url);
                console.error('Full Headers:', error.config.headers);
                console.error('Full Params:', error.config.params);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testAccuWeatherAPI();
