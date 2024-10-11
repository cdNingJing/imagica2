import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import ShapeList from './ShapeList';
import { useShapeStore } from '../store/ShapeStore';
import DraggableComponent from './DraggableComponent';
import TextToShape from './TextToShape';

const CustomShapeNode: React.FC<any> = ({ data }) => {
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore();
  
  const [visibleShapes, setVisibleShapes] = useState<Set<string>>(new Set(shapes.map(shape => shape.isVisible ? shape.id : '')));
  const maxZIndex = useMemo(() => {
    return Math.max(...shapes.map(shape => shape.zIndex || 0), 0);
  }, [shapes]);
  let ShapeComponent;
  switch (data.shape) {
    case 'circle':
      ShapeComponent = (props: any) => <circle {...props} cx={data.width / 2} cy={data.height / 2} r={Math.min(data.width, data.height) / 2} />;
      break;
    case 'triangle':
      ShapeComponent = (props: any) => (
        <polygon {...props} points={`${data.width / 2},0 ${data.width},${data.height} 0,${data.height}`} />
      );
      break;
    default: // rectangle
      ShapeComponent = (props: any) => <rect {...props} width={data.width} height={data.height} />;
  }

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    updateShapePosition(id, x, y);
  }, [updateShapePosition]);

  const handleUpdateZIndex = useCallback((id: string, newZIndex: number) => {
    updateShapeZIndex(id, newZIndex);
  }, [updateShapeZIndex]);

  return (
    <div>
      {/* <DraggableComponent
        key={data.shape.id}
        initialX={data.shape.x}
        initialY={data.shape.y}
        initialZIndex={data.shape.zIndex}
        maxZIndex={maxZIndex}
        onDragEnd={(x, y) => handleDragEnd(data.shape.id, x, y)}
        onUpdateZIndex={(newZIndex) => handleUpdateZIndex(data.shape.id, newZIndex)}
      >
        <TextToShape data={data.shape} />
      </DraggableComponent> */}

      <Handle type="target" position={Position.Top} />
        <div>
          <label htmlFor="text">Text:</label>
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
        />
    </div>
  );
};

export default CustomShapeNode;