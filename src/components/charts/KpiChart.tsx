import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface KpiChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      type?: 'line' | 'bar';
    }[];
  };
  title?: string;
  chartType?: 'line' | 'bar' | 'mixed';
}

export const KpiChart: React.FC<KpiChartProps> = ({
  data,
  title = 'Key Performance Indicators',
  chartType = 'line'
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2);
          }
        }
      }
    }
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return <Bar options={options} data={data} />;
    }
    return <Line options={options} data={data} />;
  };

  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow-md">
      {renderChart()}
    </div>
  );
}; 