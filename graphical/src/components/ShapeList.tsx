import React from 'react';
import { ShapeData } from '../store/ShapeStore';
import DraggableComponent from './DraggableComponent';
import TextToShape from './TextToShape';
import { ScrollableComponent } from './ScrollableComponent';

interface ShapeListProps {
  shapes: ShapeData[];
  visibleShapes: Set<string>;
  maxZIndex: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onUpdateZIndex: (id: string, newZIndex: number) => void;
}

const ShapeList: React.FC<ShapeListProps> = ({ shapes, visibleShapes, maxZIndex, onDragEnd, onUpdateZIndex }) => {
  return (
    <>
      {shapes.filter(shape => visibleShapes.has(shape.id)).map(shape => (
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
          <ScrollableComponent />
        </DraggableComponent>
      ))}
    </>
  );
};

export default ShapeList;