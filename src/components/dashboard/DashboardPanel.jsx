import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Clock, 
  Camera,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AgeDistributionChart, 
  GenderDistributionChart, 
  DailyVisitorTrendChart, 
  WeeklyVisitorTrendChart, 
  TopCamerasChart, 
  WeatherVisitorCorrelationChart 
} from '../Charts';

const StatCard = ({ icon: Icon, label, value, className }) => (
  <div className={cn("bg-muted/50 rounded-lg p-3 flex items-center gap-3", className)}>
    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);

const ChartSection = ({ icon: Icon, title, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 rounded-lg transition-colors p-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-3">
          <div className="h-[200px]">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const DashboardPanel = ({ processedData, summary, city, isOpen, onClose }) => {
  if (!isOpen || !processedData) {
    return null;
  }

  return (
    <div className="w-[480px] lg:w-[560px] h-full border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics Dashboard
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Realtidsöversikt av besöksdata
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-1 gap-2">
            <StatCard 
              icon={Users} 
              label="Totalt besökare" 
              value={summary?.totalVisitors?.toLocaleString() || '0'} 
            />
            <StatCard 
              icon={Clock} 
              label="Snitt besökstid" 
              value={summary?.averageVisitDuration || '0 min'} 
            />
            <StatCard 
              icon={Camera} 
              label="Aktiva kameror" 
              value={summary?.activeCameras || '0'} 
            />
          </div>

          {/* Charts */}
          <div className="space-y-2">
            <ChartSection icon={BarChart3} title="Åldersfördelning" defaultExpanded>
              <AgeDistributionChart data={processedData.ageDistribution} />
            </ChartSection>

            <ChartSection icon={PieChartIcon} title="Könsfördelning">
              <GenderDistributionChart data={processedData.genderDistribution} />
            </ChartSection>

            <ChartSection icon={TrendingUp} title="Daglig trend">
              <DailyVisitorTrendChart data={processedData.visitsOverTime} />
            </ChartSection>

            <ChartSection icon={TrendingUp} title="Veckotrend">
              <WeeklyVisitorTrendChart data={processedData.weeklyVisitorTrend} />
            </ChartSection>

            <ChartSection icon={Camera} title="Top 5 kameror">
              <TopCamerasChart data={processedData.topCameras} />
            </ChartSection>

            <ChartSection icon={Cloud} title={`Väder & Besökare (${city})`}>
              <WeatherVisitorCorrelationChart data={processedData.weatherVisitorCorrelation} />
            </ChartSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DashboardPanel;
