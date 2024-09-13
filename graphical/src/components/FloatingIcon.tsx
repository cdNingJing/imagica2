import React from 'react';
import styled from 'styled-components';

const IconContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const IconText = styled.span`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

interface FloatingIconProps {
  onClick: () => void;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ onClick }) => {
  return (
    <IconContainer onClick={onClick}>
      <IconText>AI</IconText>
    </IconContainer>
  );
};

export default FloatingIcon;