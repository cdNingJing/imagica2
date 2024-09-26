import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useCanvas } from '../store/CanvasStore';
import { useShapeStore } from '../store/ShapeStore';
import ShapeThumbnail from './ShapeThumbnail';
import ShapeList from './ShapeList';
import CanvasBackground from './CanvasBackground';
import DraggableComponent from './DraggableComponent';
import TextToShape from './TextToShape';
import { ScrollableComponent } from './ScrollableComponent';

const Canvas: React.FC = () => {
  const { updateItemPosition } = useCanvas();
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore();

  const [draggedItem, setDraggedItem] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [visibleShapes, setVisibleShapes] = useState<Set<string>>(new Set(shapes.map(shape => shape.id)));

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

  const handleLayerChange = useCallback((id: string, newLayer: number) => {
    updateShapeLayer(id, newLayer);
  }, [updateShapeLayer]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    updateShapePosition(id, x, y);
  }, [updateShapePosition]);

  const handleUpdateZIndex = useCallback((id: string, newZIndex: number) => {
    updateShapeZIndex(id, newZIndex);
  }, [updateShapeZIndex]);

  const maxZIndex = useMemo(() => {
    return Math.max(...shapes.map(shape => shape.zIndex || 0), 0);
  }, [shapes]);

  const handleVisibilityChange = (index: number, isVisible: boolean) => {
    setVisibleShapes(prev => {
      const newVisibleShapes = new Set(prev);
      if (isVisible) {
        newVisibleShapes.add(shapes[index].id);
      } else {
        newVisibleShapes.delete(shapes[index].id);
      }
      return newVisibleShapes;
    });
  };

  return (
    <CanvasBackground
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ShapeThumbnail
        values={shapes}
        onVisibilityChange={handleVisibilityChange}
      >
        {shapes.map(shape => (
          <TextToShape
            key={shape.id}
            data={{
              ...shape,
              text: shape.text.substring(0, 10) + (shape.text.length > 10 ? '...' : ''),
              width: (shape.width ?? 100) / 10,
              height: (shape.height ?? 100) / 10
            }}
            isThumb={true}
          />
        ))}
      </ShapeThumbnail>
      <ShapeList
        shapes={shapes}
        visibleShapes={visibleShapes}
        maxZIndex={maxZIndex}
        onDragEnd={handleDragEnd}
        onUpdateZIndex={handleUpdateZIndex}
      />
    </CanvasBackground>
  );
};

export default Canvas;