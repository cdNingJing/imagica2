import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  NodeTypes,
  OnNodesChange,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import TextToShape from './TextToShape';
import { useCanvas } from '../store/CanvasStore';
import { useShapeStore } from '../store/ShapeStore';
import ShapeThumbnail from './ShapeThumbnail';
import ShapeList from './ShapeList';
import CustomShapeNode from './CustomShapeNode';
import ChatWindow from './ChatWindow';
import TextUpdaterNode from './TextUpdaterNode'
const customNodeTypes: any = {
  customShape: CustomShapeNode,
};

const nodeTypes = { textUpdater: TextUpdaterNode };

const initialNodes = [
  {
    id: 'node-1',
    type: 'customShape',
    position: { x: 0, y: 0 },
    data: { value: 123 },
    draggable: true,
  },
  {
    id: 'node-2',
    type: 'customShape',
    position: { x: 100, y: 100 },
    data: { value: 123 },
    draggable: true,
  },
];

const Canvas: React.FC = () => {
  const { updateItemPosition } = useCanvas();
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore();

  const nodes: any[] = useMemo(() => shapes.map((shape: any) => ({
    id: shape.id,
    type: 'customShape',
    position: { x: shape.x, y: shape.y },
    width: 100,
    height: 100,
    draggable: true,
    data: { 
      shape: shape,
      text: shape.text,
      backgroundColor: shape.backgroundColor || '#4a4a4a'
    },
  })), [shapes]);

  const [nodesData, setNodesData] = useState<Node[]>(nodes);
  console.log("111 nodesData", nodesData)

  const [visibleShapes, setVisibleShapes] = useState<Set<string>>(new Set(shapes.map(shape => shape.isVisible ? shape.id : '')));

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      updatedNodes.forEach(node => {
        updateShapePosition(node.id, node.position.x, node.position.y);
      });
    },
    [nodes, updateShapePosition]
  );

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

  useEffect(() => {
    setVisibleShapes(prevVisibleShapes => {
      const newVisibleShapes = new Set(prevVisibleShapes);
      shapes.forEach(shape => {
        if (shape.isVisible) {
          newVisibleShapes.add(shape.id);
        } else {
          newVisibleShapes.delete(shape.id);
        }
      });
      return newVisibleShapes;
    });
  }, [shapes]);

  const rfStyle = useMemo(() => ({
    backgroundImage: `
      linear-gradient(to right, #B8CEFF 1px, transparent 1px),
      linear-gradient(to bottom, #B8CEFF 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundColor: '#ffffff',
  }), []);

  const onNodesChangeData: any = useCallback(
    (changes: any) => setNodesData((nds: any) => applyNodeChanges(changes, nds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodesData}
        edges={[]}
        onNodesChange={onNodesChangeData}
        nodeTypes={customNodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <ShapeThumbnail
          values={shapes}
          onVisibilityChange={handleVisibilityChange}
        >
          {shapes.map((shape: any) => (
            shape.isVisible ? (
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
            ) : null
          ))}
        </ShapeThumbnail>
      </ReactFlow>
    </div>
  );
};

export default Canvas;