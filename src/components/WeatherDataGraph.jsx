import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle } from 'lucide-react';

const getWeatherIcon = (condition) => {
  switch (condition.toLowerCase()) {
    case 'clouds':
      return <Cloud className="w-4 h-4 text-gray-500" />;
    case 'clear':
      return <Sun className="w-4 h-4 text-yellow-500" />;
    case 'rain':
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    case 'snow':
      return <CloudSnow className="w-4 h-4 text-blue-200" />;
    case 'thunderstorm':
      return <CloudLightning className="w-4 h-4 text-purple-500" />;
    case 'drizzle':
      return <CloudDrizzle className="w-4 h-4 text-blue-300" />;
    default:
      return <Cloud className="w-4 h-4 text-gray-500" />;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-bold">{format(new Date(label), 'MMM dd')}</p>
        <div className="flex items-center gap-2 mt-2">
          {getWeatherIcon(payload[0]?.payload.condition)}
          <span className="capitalize">{payload[0]?.payload.condition}</span>
        </div>
        <p className="text-sm">Temperature: {payload[0]?.value}°C</p>
        <p className="text-sm">Humidity: {payload[1]?.value}%</p>
      </div>
    );
  }
  return null;
};

const WeatherDataGraph = ({ weatherData }) => {
  return (
    <Card className="mt-8 bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-blue-700">Weather API Test Data (Last 7 Days)</CardTitle>
        <div className="flex gap-4 mt-2">
          {weatherData.map((data, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span>{format(new Date(data.date), 'MMM dd')}:</span>
              {getWeatherIcon(data.condition)}
              <span className="capitalize">{data.condition}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#8884d8"
                name="Temperature (°C)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#82ca9d"
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDataGraph;