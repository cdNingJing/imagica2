import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';

const DraggableContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  cursor: move;
`;

interface DraggableComponentProps {
  initialX: number;
  initialY: number;
  initialZIndex: number;
  maxZIndex: number;
  children: React.ReactNode;
  onDragEnd?: (x: number, y: number) => void;
  onUpdateZIndex?: (newZIndex: number) => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ 
  initialX, initialY, initialZIndex, children, onDragEnd, onUpdateZIndex, maxZIndex
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const zIndexRef = useRef(initialZIndex);

  const updateZIndex = useCallback(() => {
    zIndexRef.current = maxZIndex + 1;
    if (onUpdateZIndex) {
      onUpdateZIndex(zIndexRef.current);
    }
  }, [onUpdateZIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    updateZIndex();
  }, [position, updateZIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(position.x, position.y);
    }
  }, [onDragEnd, position]);

  return (
    <DraggableContainer
      x={position.x}
      y={position.y}
      style={{ zIndex: zIndexRef.current, userSelect: 'none' }}
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