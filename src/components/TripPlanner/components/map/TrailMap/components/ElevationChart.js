import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// רישום הקומפוננטות הנדרשות
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ElevationChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // עיבוד הנתונים לפורמט המתאים לתרשים
  const chartData = {
    labels: data.map((_, index) => `${(index / data.length * 100).toFixed(0)}%`),
    datasets: [
      {
        label: 'גובה (מטרים)',
        data: data.map(point => point.elevation),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'גובה (מטרים)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'התקדמות במסלול',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ElevationChart;
