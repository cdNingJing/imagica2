import React from 'react';
import './WaveLoader.scss'; // 我们将在下一步创建这个文件

interface WaveLoaderProps {
  className?: string;
}

const WaveLoader: React.FC<WaveLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`loading-container ${className}`}>
      <div className="wave-loader">
        <div className="wave-loader__wave"></div>
        <div className="wave-loader__wave"></div>
        <div className="wave-loader__wave"></div>
        <div className="wave-loader__wave"></div>
        <div className="wave-loader__wave"></div>
        <div className="wave-loader__wave"></div>
      </div>
    </div>
  );
};

export default WaveLoader;