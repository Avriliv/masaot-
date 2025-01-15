const axios = require('axios');

const API_KEY = 'cdd3d621bd33d76a7187f38b1776cdc8';
const TEST_LAT = 32.0853; // תל אביב
const TEST_LON = 34.7818;

async function testOpenWeatherAPI() {
    try {
        console.log('בודק את OpenWeather API...');
        
        const url = `https://api.openweathermap.org/data/2.5/forecast`;
        const response = await axios.get(url, {
            params: {
                lat: TEST_LAT,
                lon: TEST_LON,
                appid: API_KEY,
                units: 'metric', // טמפרטורה במעלות צלזיוס
                lang: 'he' // שפה בעברית
            }
        });
        
        console.log('סטטוס התגובה:', response.status);
        console.log('מידע שהתקבל:', JSON.stringify(response.data, null, 2));
        
        console.log('\nהבדיקה הושלמה בהצלחה!');
        
    } catch (error) {
        console.error('\nשגיאה בבדיקת OpenWeather API:');
        if (error.response) {
            console.error('סטטוס השגיאה:', error.response.status);
            console.error('פרטי השגיאה:', error.response.data);
            console.error('כותרות התגובה:', error.response.headers);
            
            if (error.config) {
                console.error('כתובת URL מלאה:', error.config.url);
                console.error('פרמטרים:', error.config.params);
            }
        } else if (error.request) {
            console.error('לא התקבלה תגובה:', error.request);
        } else {
            console.error('שגיאה:', error.message);
        }
    }
}

// הרצת הבדיקה
testOpenWeatherAPI();
