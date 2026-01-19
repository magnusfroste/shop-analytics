import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AgeDistributionChart = ({ data }) => (
  <BarChart width={400} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="age" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="count" fill="#8884d8" />
  </BarChart>
);

export const GenderDistributionChart = ({ data }) => (
  <PieChart width={400} height={300}>
    <Pie
      data={data}
      cx={200}
      cy={150}
      labelLine={false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
);

export const DailyVisitorTrendChart = ({ data }) => (
  <AreaChart width={800} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" />
  </AreaChart>
);

export const WeeklyVisitorTrendChart = ({ data }) => (
  <LineChart width={400} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="week" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="count" stroke="#82ca9d" />
  </LineChart>
);

export const TopCamerasChart = ({ data }) => (
  <BarChart width={400} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="cameraId" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="count" fill="#ffc658" />
  </BarChart>
);

export const WeatherVisitorCorrelationChart = ({ data }) => (
  <BarChart width={800} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
    <Tooltip />
    <Legend />
    <Bar yAxisId="left" dataKey="visitors" fill="#8884d8" name="Visitors" />
    <Bar yAxisId="right" dataKey="condition" fill="#82ca9d" name="Weather Condition" />
  </BarChart>
);