import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useCanvas } from '../store/CanvasStore';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f0f0f0;
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const CanvasItem = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  padding: 10px;
  background-color: #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: move;
  user-select: none;
`;

const TestButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
`;

const Canvas: React.FC = () => {
  const { items, updateItemPosition } = useCanvas();
  const [draggedItem, setDraggedItem] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setDraggedItem({
        id,
        startX: e.clientX - item.position.x,
        startY: e.clientY - item.position.y
      });
    }
  }, [items]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedItem) {
      const newX = e.clientX - draggedItem.startX;
      const newY = e.clientY - draggedItem.startY;
      updateItemPosition(draggedItem.id, newX, newY);
    }
  }, [draggedItem, updateItemPosition]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return (
    <CanvasContainer
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {items.map(item => (
        <CanvasItem
          key={item.id}
          x={item.position.x}
          y={item.position.y}
        >
          <p>{item.content}</p>
        </CanvasItem>
      ))}
    </CanvasContainer>
  );
};

export default Canvas;