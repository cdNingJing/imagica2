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

  const travelPlan = [
    "提前规划：无论是短途还是长途旅行，提前规划是关键。确定目的地后，研究当地的天气、交通、住宿、必游景点及特色美食，制定一个大致的行程表。",
    "预订住宿：根据行程安排，提前预订住宿可以确保有地方住，避免临时找不到住宿的尴尬。同时，提前预订往往能享受更优惠的价格。",
    "购买旅行保险：购买一份旅行保险，为行程中的意外情况提供保障，比如行李丢失、疾病或取消行程等。",
    "准备必备物品：根据目的地和季节准备行李，包括合适的衣物、药品（特别是常用药和急救包）、充电器、相机、防晒霜、雨具等。",
    "了解当地文化与习俗：在出发前，了解目的地的文化习俗、礼仪规范，这有助于您更好地融入当地生活，避免不必要的误会。",
    "尝试当地美食：旅行不仅是看风景，更是体验不同的生活方式和美食文化。不妨尝试当地的特色菜肴和小吃，让味蕾也来一场旅行。",
    "保持联系：与家人或朋友保持联系，告知他们您的行程安排和联系方式，确保安全。同时，携带一部手机并保持电量充足，以便在需要时寻求帮助。",
    "灵活调整行程：虽然提前规划很重要，但也要保持灵活性。遇到天气变化、景点关闭等不可预见的情况时，能够及时调整行程，避免影响整体旅行体验。",
    "尊重自然与环境：在旅行过程中，注意保护环境，不乱扔垃圾，不破坏自然景观和文化遗产。做一个负责任的旅行者。",
    "享受当下：最后但同样重要的是，放松心情，享受旅行的过程。无论是独自旅行还是与家人朋友同行，都要珍惜这段时光，留下美好的回忆。"
  ];

  return (
    <div className="scrollable-component">
      <div className="toggle-button-group">
        <button 
          onClick={handleToggleA} 
          className={`toggle-button ${isToggled ? 'active' : ''}`}
        >
          显示图文
        </button>
        <button 
          onClick={handleToggleB} 
          className={`toggle-button ${!isToggled ? 'active' : ''}`}
        >
          显示数据
        </button>
      </div>
      <div className="content">
        {isToggled ? (
          <div>
            <h2>去云南的旅游路线</h2>
            <img className="chart-image" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw%2Fc7a6709c-ce99-404c-9866-00c7e3db5523%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1729934074&t=7556ed3ea36603972f1d503527dd7ac9" alt="" />
              {/* {imageUrls.map((url, index) => (
                <img className="chart-image" key={index} src={url} alt={`Image ${index + 1}`} />
              ))} */}
          </div>
        ) : (
          <div className="timeline-container">
            {travelPlan.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-content">
                  <h3>步骤 {index + 1}</h3>
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};