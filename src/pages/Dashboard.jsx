import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Settings as SettingsIcon, Users, BarChart, PieChart } from "lucide-react";
import { fetchVisitorData } from '../utils/supabaseClient';
import { processDataForCharts } from '../utils/dataProcessing';
import { DashboardSummary, ChartCard } from '../components/DashboardComponents';
import { AgeDistributionChart, GenderDistributionChart, DailyVisitorTrendChart, WeeklyVisitorTrendChart, TopCamerasChart, WeatherVisitorCorrelationChart } from '../components/Charts';
import ChatGPT from '../components/ChatGPT';
import SettingsModal from '../components/SettingsModal';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '../components/Header';
import Footer from '../components/Footer';
import WeatherSection from '../components/WeatherSection';
import { fetchWeatherData } from '../utils/weatherApi';
import { subDays } from 'date-fns';
import { toast } from 'sonner';

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [processedData, setProcessedData] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    city: 'Paris',
  });
  
  // Default values for ChatGPT - remove the API key since it will be handled by Supabase
  const defaultSystemPrompt = 'You are a very resourceful assistant with awesome analytics skills providing excellent insights about visitor data for a store.';
  const defaultUserPrompt = 'Based on the following aggregated visitor data, {question}\n\nAggregated Visitor Data: {visitorData}';
  const defaultChatGPTModel = 'gpt-4.1-2025-04-14';

  const { data: visitorData, isLoading, error: visitorDataError } = useQuery({
    queryKey: ['visitorData'],
    queryFn: fetchVisitorData,
  });

  useEffect(() => {
    const savedCity = localStorage.getItem('city');
    setSettings(prev => ({
      ...prev,
      city: savedCity || prev.city,
    }));
  }, []);

  useEffect(() => {
    if (visitorData) {
      setFilteredData(visitorData);

      processDataForCharts(visitorData, null, settings.city).then(data => {
        setProcessedData(data);
        setError(null);
      }).catch(err => {
        console.error('Error processing data:', err);
        setError(err.message);
      });

      const fetchWeatherTestData = async () => {
        try {
          const dates = Array.from({length: 7}, (_, i) => subDays(new Date(), i));
          const data = await fetchWeatherData(dates, settings.city);
          setWeatherData(data.reverse());
        } catch (error) {
          console.error('Error fetching weather test data:', error);
          toast.error('Failed to fetch weather test data');
        }
      };

      fetchWeatherTestData();
    }
  }, [visitorData, settings.city]);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('city', newSettings.city);
    setIsSettingsOpen(false);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (visitorDataError) return <div className="flex justify-center items-center h-screen">Error: {visitorDataError.message}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Chat With Your Visitor Data (POC)
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link to="/admin" className="flex-1 sm:flex-none">
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-all w-full sm:w-auto text-sm">
                Admin
              </Button>
            </Link>
            <Button 
              onClick={() => setIsSettingsOpen(true)} 
              variant="outline" 
              className="shadow-sm hover:shadow-md transition-all flex items-center flex-1 sm:flex-none text-sm"
            >
              <SettingsIcon className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Analysis </span>Settings
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Users className="mr-2" />
                Visitor Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Anavid enables monitoring of visitor data in real-time by applying computer vision to camera feeds in store.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <BarChart className="mr-2" />
                Data Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Anavid aggregates the anonymized data and provides insightful charts and graphs of visitor trends.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <PieChart className="mr-2" />
                Get Advice & recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Anavid explores latest AI development: Ask questions & get advices from Ana, an GPT assistent.</p>
            </CardContent>
          </Card>
        </div>

        {processedData && (
          <>
            <div className="mb-8">
              <ChatGPT 
                visitorData={filteredData}
                weatherData={processedData.weatherVisitorCorrelation}
                systemPrompt={defaultSystemPrompt}
                userPrompt={defaultUserPrompt}
                model={defaultChatGPTModel}
              />
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
              <DashboardSummary data={{ 
                totalVisitors: filteredData.length, 
                averageVisitDuration: processedData.averageVisitDuration, 
                activeCameras: processedData.topCameras.length
              }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ChartCard title="Age Distribution" chart={<AgeDistributionChart data={processedData.ageDistribution} />} />
              <ChartCard title="Gender Distribution" chart={<GenderDistributionChart data={processedData.genderDistribution} />} />
              <ChartCard title="Daily Visitor Trend" chart={<DailyVisitorTrendChart data={processedData.visitsOverTime} />} className="lg:col-span-2" />
              <ChartCard title="Weekly Visitor Trend" chart={<WeeklyVisitorTrendChart data={processedData.weeklyVisitorTrend} />} />
              <ChartCard title="Top 5 Active Cameras" chart={<TopCamerasChart data={processedData.topCameras} />} />
              <ChartCard 
                title={`Weather and Visitors in ${settings.city}`} 
                chart={<WeatherVisitorCorrelationChart data={processedData.weatherVisitorCorrelation} />} 
                className="lg:col-span-2" 
              />
            </div>

            <WeatherSection weatherData={weatherData} city={settings.city} />
          </>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsChange}
          settings={settings}
          type="analysis"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
