import React, { useState } from 'react';
import styled from 'styled-components';

const ThumbnailContainer = styled.div<{ isCollapsed: boolean }>`
  background-color: #2c2c2c;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  padding: 12px 5px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100vh;
  width: ${props => props.isCollapsed ? '64px' : '220px'};
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

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin-right: 18px;
`;

const ThumbnailHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
`;

const ThumbnailItem = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  background-color: #3c3c3c;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};

  &:hover {
    background-color: #4c4c4c;
  }
`;

const ThumbnailPreview = styled.div<{ isCollapsed: boolean }>`
  width: 40px;
  height: 40px;
  background-color: #555;
  border-radius: 4px;
  margin-right: ${props => props.isCollapsed ? '0' : '12px'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ThumbnailName = styled.span`
  color: #ddd;
  font-size: 14px;
`;

const ThumbnailInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const EyeIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: #ddd;
  margin-left: 8px;
`;

interface ShapeThumbnailProps {
  children: React.ReactNode;
  values: { text: string }[];
}

const ShapeThumbnail: React.FC<ShapeThumbnailProps> = ({ children, values }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const childrenArray = React.Children.toArray(children);

  return (
    <ThumbnailContainer isCollapsed={isCollapsed}>
      <ThumbnailHeader>
        <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '▶' : '◀'}
        </CollapseButton>
      </ThumbnailHeader>
      {childrenArray.map((child, index) => (
        <ThumbnailItem key={index} isCollapsed={isCollapsed}>
          <ThumbnailPreview isCollapsed={isCollapsed}>
            {React.cloneElement(child as React.ReactElement, { style: { transform: 'scale(0.15)' } })}
          </ThumbnailPreview>
          {!isCollapsed && (
            <ThumbnailInfo>
              <ThumbnailName>
                {values[index]?.text?.substring(0, 10) + (values[index]?.text?.length > 10 ? '...' : '')}
              </ThumbnailName>
              <EyeIcon viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </EyeIcon>
            </ThumbnailInfo>
          )}
        </ThumbnailItem>
      ))}
    </ThumbnailContainer>
  );
};

export default ShapeThumbnail;