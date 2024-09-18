import React, { useState } from 'react';
import styled from 'styled-components';

// 修改 ThumbnailContainer 的定义
const ThumbnailContainer = styled.div<{ $isCollapsed: boolean }>`
  background-color: #2c2c2c;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  padding: 12px 5px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100vh;
  width: ${props => props.$isCollapsed ? '64px' : '220px'};
  overflow-y: auto;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease-in-out;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

// 修改 CollapseButton 的定义
const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin-right: 18px;
`;

// 修改 ThumbnailHeader 的定义
const ThumbnailHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  background-color: #2c2c2c;
  z-index: 1;
  padding: 12px 5px;
`;

// 修改 CloseButton 的定义
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
`;

// 修改 ThumbnailItem 的定义
const ThumbnailItem = styled.div<{ $isCollapsed: boolean; $isHidden: boolean }>`
  display: flex;
  align-items: center;
  background-color: #3c3c3c;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  margin-bottom: 10px;
  &:hover {
    background-color: #4c4c4c;
  }

  opacity: ${props => props.$isHidden ? 0.5 : 1};
`;

// 修改 ThumbnailPreview 的定义
const ThumbnailPreview = styled.div<{ $isCollapsed: boolean; $isHidden: boolean }>`
  width: 40px;
  height: 40px;
  background-color: #555;
  border-radius: 4px;
  margin-right: ${props => props.$isCollapsed ? '0' : '12px'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: ${props => props.$isHidden ? 0.5 : 1};
`;

// 修改 ThumbnailName 的定义
const ThumbnailName = styled.span<{ $isHidden: boolean }>`
  color: #ddd;
  font-size: 14px;
  opacity: ${props => props.$isHidden ? 0.5 : 1};
`;

// 修改 ThumbnailInfo 的定义
const ThumbnailInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

// 修改 EyeIcon 的定义
const EyeIcon = styled.svg<{ $isHidden: boolean }>`
  width: 16px;
  height: 16px;
  fill: #ddd;
  margin-left: 8px;
  cursor: pointer;
  transition: opacity 0.3s;
  opacity: ${props => props.$isHidden ? 0.5 : 1};
`;

// 新增 ThumbnailContent 和 ThumbnailFooter 组件
const ThumbnailContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 5px;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ThumbnailFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: #2c2c2c;
  z-index: 1;
  padding: 12px 5px;
`;

const FooterButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  width: 100%;
  text-align: center;
  &:hover {
    background-color: #3c3c3c;
  }
`;

interface ShapeThumbnailProps {
  children: React.ReactNode;
  values: { text: string }[];
}

const ShapeThumbnail: React.FC<ShapeThumbnailProps> = ({ children, values }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hiddenItems, setHiddenItems] = useState<boolean[]>([]);
  const childrenArray = React.Children.toArray(children);

  const toggleItemVisibility = (index: number) => {
    setHiddenItems(prev => {
      const newHiddenItems = [...prev];
      newHiddenItems[index] = !newHiddenItems[index];
      return newHiddenItems;
    });
  };

  return (
    <ThumbnailContainer $isCollapsed={isCollapsed}>
      <ThumbnailHeader>
        <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '▶' : '◀'}
        </CollapseButton>
      </ThumbnailHeader>
      <ThumbnailContent>
        {childrenArray.map((child, index) => (
          <ThumbnailItem key={index} $isCollapsed={isCollapsed} onClick={() => toggleItemVisibility(index)} $isHidden={hiddenItems[index]}>
            <ThumbnailPreview $isCollapsed={isCollapsed} $isHidden={hiddenItems[index]}>
              {React.cloneElement(child as React.ReactElement, { 
                style: { 
                  transform: 'scale(0.15)',
                } 
              })}
            </ThumbnailPreview>
            {!isCollapsed && (
              <ThumbnailInfo>
                <ThumbnailName $isHidden={hiddenItems[index]}>
                  {values[index]?.text?.substring(0, 10) + (values[index]?.text?.length > 10 ? '...' : '')}
                </ThumbnailName>
                <EyeIcon 
                  viewBox="0 0 24 24" 
                  $isHidden={hiddenItems[index]}
                >
                  {hiddenItems[index] ? (
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  ) : (
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
                  )}
                </EyeIcon>
              </ThumbnailInfo>
            )}
          </ThumbnailItem>
        ))}
      </ThumbnailContent>
      <ThumbnailFooter>
        <FooterButton onClick={() => {/* 添加您的操作 */}}>
          {isCollapsed ? '+' : '开始融合'}
        </FooterButton>
      </ThumbnailFooter>
    </ThumbnailContainer>
  );
};

export default ShapeThumbnail;