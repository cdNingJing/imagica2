import React from 'react';
import { ShapeData } from '../store/ShapeStore';
import DraggableComponent from './DraggableComponent';
import TextToShape from './TextToShape';

interface ShapeListProps {
  shapes: ShapeData[];
  visibleShapes: string[];
  maxZIndex: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onUpdateZIndex: (id: string, newZIndex: number) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({ shapes, visibleShapes, maxZIndex, onDragEnd, onUpdateZIndex }) => {
  return (
    <>
      {shapes.map(shape => (
        visibleShapes.includes(shape.id) && (
          <DraggableComponent
            key={shape.id}
            initialX={shape.x}
            initialY={shape.y}
            initialZIndex={shape.zIndex}
            maxZIndex={maxZIndex}
            onDragEnd={(x, y) => onDragEnd(shape.id, x, y)}
            onUpdateZIndex={(newZIndex) => onUpdateZIndex(shape.id, newZIndex)}
          >
            <TextToShape data={shape} />
          </DraggableComponent>
        )
      ))}
    </>
  );
};

export default ShapeList;