import React from 'react';
import styled from 'styled-components';

const ThumbnailContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ThumbnailItem = styled.div`
  transform: scale(0.5);
  transform-origin: top left;
`;

interface ShapeThumbnailProps {
  children: React.ReactNode;
}

const ShapeThumbnail: React.FC<ShapeThumbnailProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    
    <ThumbnailContainer>
      {childrenArray.map((child, index) => (
        <ThumbnailItem key={index}>{child}</ThumbnailItem>
      ))}
    </ThumbnailContainer>
  );
};

export default ShapeThumbnail;