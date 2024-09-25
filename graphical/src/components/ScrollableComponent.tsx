import React, { useState, useEffect } from 'react';
import './ScrollableComponent.css';
import { useDataStore } from '../store/data-store';

export const ScrollableComponent: React.FC<any> = () => {
  const [isToggled, setIsToggled] = useState(false);
  const { imageUrls, description, updateImageUrls, updateDescription } = useDataStore();
  const handleToggleA = () => {
    setIsToggled(true);
  };

  useEffect(() => {
    console.log("111 data", imageUrls);
  }, [imageUrls]);

  const handleToggleB = () => {
    setIsToggled(false);
  };

  return (
    <div className="scrollable-component">
      <div className="header">
        <button onClick={handleToggleA} className="toggle-button">
          显示图文
        </button>
        <button onClick={handleToggleB} className="toggle-button">
          显示数据
        </button>
      </div>
      <div className="content">
        <h2>{description}</h2>
        <div>
          {imageUrls.map((url, index) => (
            <img className="chart-image" key={index} src={url} alt={`Image ${index + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
};