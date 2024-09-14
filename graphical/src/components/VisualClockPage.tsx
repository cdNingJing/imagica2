import React from 'react';
import VisualClock from '../components/VisualClock';
import { useLocation } from 'react-router-dom';

const VisualClockPage: React.FC = () => {
  const location = useLocation();
  const { time } = location.state as { time: string };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">可视化时钟</h1>
      <VisualClock time={time} />
    </div>
  );
};

export default VisualClockPage;