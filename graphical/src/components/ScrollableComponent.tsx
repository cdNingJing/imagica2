import React, { useState } from 'react';
import './ScrollableComponent.css';

interface ScrollableComponentProps {
  // 可以根据需要添加更多属性
}

export const ScrollableComponent: React.FC<ScrollableComponentProps> = () => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggleA = () => {
    setIsToggled(true);
  };

  const handleToggleB = () => {
    setIsToggled(false);
  };

  const imageUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-vX3fv9TXt6V8qaFahI6IrHQa/user-4fPKb9ErvGdInEIomvudXHp0/img-Lx2PtBhdEpy8Pw5q2fZZtjYB.png?st=2024-09-23T07%3A18%3A54Z&se=2024-09-23T09%3A18%3A54Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-09-23T01%3A35%3A01Z&ske=2024-09-24T01%3A35%3A01Z&sks=b&skv=2024-08-04&sig=Ovyt9C%2BZ%2B9aAAFuBx9euHMDehV9EaBwbq33jck2eDqw%3D'; // 替换为实际生成的图片URL
  const description = `Generate chart, Chart Title: Global Population Growth Trends (Forecast 1950-2050),X-axis: Year,Y-axis: Global population (billion),The chart shows that the population has grown from about 2.5 billion in 1950 to about 8 billion in 2023 and is projected to reach about 9.7 billion by 2050. The growth curve has accelerated significantly in recent decades, especially in Asia and Africa.`;

  return (
    <div className="scrollable-component">
      <div className="header">
        <button onClick={handleToggleA} className="toggle-button">
          切换到状态A
        </button>
        <button onClick={handleToggleB} className="toggle-button">
          切换到状态B
        </button>
      </div>
      <div className="content">
        <h2>Global Population Growth Trends (Forecast 1950-2050)</h2>
        <img src={imageUrl} alt="Global Population Growth Trends" className="chart-image" />
      </div>
    </div>
  );
};