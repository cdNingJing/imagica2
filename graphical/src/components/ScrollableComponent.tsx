import React, { useState, useEffect } from 'react';
import './ScrollableComponent.css';
import { useDataStore } from '../store/data-store';
interface ScrollableComponentProps {
  // 可以根据需要添加更多属性
}

export const ScrollableComponent: React.FC<ScrollableComponentProps> = () => {
  const [isToggled, setIsToggled] = useState(false);
  const { data, setData } = useDataStore();
  const handleToggleA = () => {
    setIsToggled(true);
  };

  const handleToggleB = () => {
    setIsToggled(false);
  };

  console.log("111 data", data)
  const imageUrls = data?.imageUrls || "https://oaidalleapiprodscus.blob.core.windows.net/private/org-vX3fv9TXt6V8qaFahI6IrHQa/user-4fPKb9ErvGdInEIomvudXHp0/img-pMVhq6ZYUAgTrlUb6tztXoAO.png?st=2024-09-23T11%3A28%3A57Z&se=2024-09-23T13%3A28%3A57Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-09-22T23%3A19%3A00Z&ske=2024-09-23T23%3A19%3A00Z&sks=b&skv=2024-08-04&sig=SQCmix8uJTEV0uMaZKtrE8uWlcCTzi67Ua4EJ4I7xks%3D";
  const description = data?.description || '';

  useEffect(() => {
    console.log("222 data", data)
  }, [data])

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
          {imageUrls.split(',').map((url, index) => (
            <img className="chart-image" key={index} src={url} alt={`Image ${index + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
};