import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeatherDataGraph from './WeatherDataGraph';

const WeatherSection = ({ weatherData, city }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Weather Data for {city} (Last 7 Days)
      </h2>
      <WeatherDataGraph weatherData={weatherData} />
    </div>
  );
};

export default WeatherSection;