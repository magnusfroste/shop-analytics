import { format, parseISO, differenceInMinutes, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { fetchWeatherData } from './weatherApi';

export const processDataForCharts = async (data, selectedDate, city) => {
  const processedData = {
    ageDistribution: processAgeDistribution(data),
    genderDistribution: processGenderDistribution(data),
    visitsOverTime: processVisitsOverTime(data),
    weeklyVisitorTrend: processWeeklyVisitorTrend(data),
    topCameras: processTopCameras(data),
    averageVisitDuration: calculateAverageVisitDuration(data),
    weatherVisitorCorrelation: await processWeatherVisitorCorrelation(data, city, selectedDate),
  };

  console.log('Processed data:', processedData);
  return processedData;
};

const processAgeDistribution = (data) => {
  const ageCounts = data.reduce((acc, visitor) => {
    acc[visitor.age] = (acc[visitor.age] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(ageCounts)
    .map(([age, count]) => ({ age, count }))
    .sort((a, b) => a.age.localeCompare(b.age));
};

const processGenderDistribution = (data) => {
  const genderCounts = data.reduce((acc, visitor) => {
    acc[visitor.gender] = (acc[visitor.gender] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
};

const processVisitsOverTime = (data) => {
  const visitCounts = data.reduce((acc, visitor) => {
    const date = format(parseISO(visitor.visit_date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(visitCounts)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const processWeeklyVisitorTrend = (data) => {
  const weeklyVisits = data.reduce((acc, visitor) => {
    const visitDate = parseISO(visitor.visit_date);
    const weekStart = format(visitDate, "yyyy-'W'II");
    acc[weekStart] = (acc[weekStart] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(weeklyVisits)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

const processTopCameras = (data) => {
  const cameraCounts = data.reduce((acc, visitor) => {
    acc[visitor.id_camera] = (acc[visitor.id_camera] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(cameraCounts)
    .map(([cameraId, count]) => ({ cameraId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const calculateAverageVisitDuration = (data) => {
  const validDurations = data
    .map(visitor => calculateVisitDuration(visitor.visit_date, visitor.leave_date))
    .filter(duration => typeof duration === 'number');

  const totalDuration = validDurations.reduce((acc, duration) => acc + duration, 0);
  return validDurations.length > 0 ? Math.round(totalDuration / validDurations.length) : 0;
};

const calculateVisitDuration = (visitDate, leaveDate) => {
  if (!visitDate || !leaveDate) return 'N/A';
  const start = parseISO(visitDate);
  const end = parseISO(leaveDate);
  return differenceInMinutes(end, start);
};

const processWeatherVisitorCorrelation = async (data, city, selectedDate) => {
  let dates;
  if (selectedDate) {
    dates = [startOfDay(selectedDate), endOfDay(selectedDate)];
  } else {
    const allDates = data.map(visitor => parseISO(visitor.visit_date));
    dates = [startOfDay(Math.min(...allDates)), endOfDay(Math.max(...allDates))];
  }

  const daysToFetch = eachDayOfInterval({ start: dates[0], end: dates[1] });

  const weatherData = await fetchWeatherData(daysToFetch, city);

  const visitorCounts = data.reduce((acc, visitor) => {
    const date = format(parseISO(visitor.visit_date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const correlation = weatherData.map(weather => ({
    date: weather.date,
    condition: weather.condition,
    visitors: visitorCounts[weather.date] || 0
  }));

  console.log('Weather-visitor correlation data:', correlation);
  return correlation;
};

export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number') return minutes;
  return `${minutes} minutes`;
};

export const aggregateDataForChatGPT = (data, weatherData) => {
  const visitorsPerDay = processVisitsOverTime(data);
  const ageDistribution = processAgeDistribution(data);
  const genderDistribution = processGenderDistribution(data);

  const aggregatedData = {
    visitorsPerDay,
    weatherData,
    ageDistribution,
    genderDistribution,
  };

  return aggregatedData;
};
