import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AgeDistributionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
      <XAxis dataKey="age" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const GenderDistributionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius="80%"
        fill="#8884d8"
        dataKey="value"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </PieChart>
  </ResponsiveContainer>
);

export const DailyVisitorTrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <defs>
        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 10 }} 
        angle={-45}
        textAnchor="end"
        height={60}
      />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Area 
        type="monotone" 
        dataKey="visits" 
        stroke="#8884d8" 
        fillOpacity={1} 
        fill="url(#colorVisits)" 
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const WeeklyVisitorTrendChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Line 
        type="monotone" 
        dataKey="count" 
        stroke="#82ca9d" 
        strokeWidth={2}
        dot={{ fill: '#82ca9d', strokeWidth: 2 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const TopCamerasChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
      <XAxis dataKey="cameraId" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar dataKey="count" fill="#ffc658" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const WeatherVisitorCorrelationChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
      <XAxis 
        dataKey="date" 
        tick={{ fontSize: 10 }} 
        angle={-45}
        textAnchor="end"
        height={60}
      />
      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12 }} />
      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }} 
      />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Bar yAxisId="left" dataKey="visitors" fill="#8884d8" name="Visitors" radius={[4, 4, 0, 0]} />
      <Bar yAxisId="right" dataKey="condition" fill="#82ca9d" name="Weather Condition" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
