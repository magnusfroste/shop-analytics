import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '';

export const fetchWeatherData = async (dates, city = 'Stockholm') => {
  try {
    // For demo purposes, we'll generate slightly different temperatures
    // since the free API doesn't support historical data
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const baseTemp = response.data.main.temp;
    const baseHumidity = response.data.main.humidity;

    return dates.map((date, index) => ({
      date: date.toISOString().split('T')[0],
      temperature: +(baseTemp + (Math.random() * 4 - 2)).toFixed(1), // Vary by ±2°C
      humidity: Math.min(100, Math.max(0, baseHumidity + (Math.random() * 10 - 5))), // Vary by ±5%
      condition: getWeatherCondition(response.data.weather[0].id),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      windSpeed: response.data.wind.speed,
      feelsLike: response.data.main.feels_like
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch weather data: ' + (error.response ? error.response.data.message : error.message));
  }
};

const getWeatherCondition = (weatherId) => {
  if (weatherId < 300) return 'Thunderstorm';
  if (weatherId < 500) return 'Drizzle';
  if (weatherId < 600) return 'Rain';
  if (weatherId < 700) return 'Snow';
  if (weatherId < 800) return 'Atmosphere';
  if (weatherId === 800) return 'Clear';
  return 'Clouds';
};