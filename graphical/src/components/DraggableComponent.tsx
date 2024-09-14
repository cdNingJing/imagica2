import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

const DraggableContainer = styled.div<{ x: number; y: number; isDragging: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  cursor: move;
  z-index: ${props => props.isDragging ? 1000 : 'auto'};
  transition: z-index 0s linear 0.2s;
`;

interface DraggableComponentProps {
  initialX: number;
  initialY: number;
  children: React.ReactNode;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ initialX, initialY, children }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <DraggableContainer
      x={position.x}
      y={position.y}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </DraggableContainer>
  );
};

export default DraggableComponent;