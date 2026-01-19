import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Camera } from 'lucide-react';
import { formatDuration } from '../utils/dataProcessing';

export const DashboardSummary = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <SummaryCard title="Total Visitors" value={data.totalVisitors} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
    <SummaryCard title="Avg. Visit Duration" value={formatDuration(data.averageVisitDuration)} icon={<Clock className="h-4 w-4 text-muted-foreground" />} />
    <SummaryCard title="Active Cameras" value={data.activeCameras} icon={<Camera className="h-4 w-4 text-muted-foreground" />} />
  </div>
);

const SummaryCard = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export const ChartCard = ({ title, chart, className = "" }) => (
  <Card className={`${className} overflow-hidden`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-2 sm:p-6">
      <div className="w-full min-h-[280px] sm:min-h-[300px]">
        {chart}
      </div>
    </CardContent>
  </Card>
);
