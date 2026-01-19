import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVisitorData } from '../utils/supabaseClient';
import { processDataForCharts } from '../utils/dataProcessing';
import ChatLayout from '../components/layouts/ChatLayout';
import SettingsModal from '../components/SettingsModal';
import { fetchWeatherData } from '../utils/weatherApi';
import { subDays } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [processedData, setProcessedData] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    city: 'Paris',
  });
  
  // Default values for ChatGPT
  const defaultSystemPrompt = 'You are a very resourceful assistant with awesome analytics skills providing excellent insights about visitor data for a store. Answer in the same language as the user\'s question.';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Laddar besöksdata...</p>
        </div>
      </div>
    );
  }

  if (visitorDataError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive font-medium">Fel vid laddning</p>
          <p className="text-muted-foreground text-sm mt-1">{visitorDataError.message}</p>
        </div>
      </div>
    );
  }

  const summary = processedData ? {
    totalVisitors: filteredData.length,
    averageVisitDuration: processedData.averageVisitDuration,
    activeCameras: processedData.topCameras?.length || 0
  } : null;

  return (
    <>
      <ChatLayout
        visitorData={filteredData}
        weatherData={processedData?.weatherVisitorCorrelation || []}
        processedData={processedData}
        summary={summary}
        city={settings.city}
        systemPrompt={defaultSystemPrompt}
        userPrompt={defaultUserPrompt}
        model={defaultChatGPTModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsChange}
        settings={settings}
        type="analysis"
      />
    </>
  );
};

export default Dashboard;
