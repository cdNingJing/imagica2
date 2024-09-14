import React from 'react';
import styled from 'styled-components';

const ThumbnailContainer = styled.div`
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 80vh;
  width: 220px;
  overflow-y: auto;
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

const ThumbnailItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #3c3c3c;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4c4c4c;
  }
`;

const ThumbnailPreview = styled.div`
  width: 40px;
  height: 40px;
  background-color: #555;
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ThumbnailName = styled.span`
  color: #ddd;
  font-size: 14px;
`;

interface ShapeThumbnailProps {
  children: React.ReactNode;
}

const ShapeThumbnail: React.FC<ShapeThumbnailProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <ThumbnailContainer>
      <ThumbnailHeader>
      </ThumbnailHeader>
      {childrenArray.map((child, index) => (
        <ThumbnailItem key={index}>
          <ThumbnailPreview>
            {React.cloneElement(child as React.ReactElement, { style: { transform: 'scale(0.15)' } })}
          </ThumbnailPreview>
          <ThumbnailName>图层 {index + 1}</ThumbnailName>
        </ThumbnailItem>
      ))}
    </ThumbnailContainer>
  );
};

export default ShapeThumbnail;