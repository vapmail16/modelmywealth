import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DualAxisChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      yAxisID?: string;
    }[];
  };
  title?: string;
  leftYAxisLabel?: string;
  rightYAxisLabel?: string;
}

export const DualAxisChart: React.FC<DualAxisChartProps> = ({
  data,
  title = 'Dual Axis Chart',
  leftYAxisLabel = 'Left Axis',
  rightYAxisLabel = 'Right Axis'
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: leftYAxisLabel,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: rightYAxisLabel,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-96 p-4 bg-white rounded-lg shadow-md">
      <Line options={options} data={data} />
    </div>
  );
}; 