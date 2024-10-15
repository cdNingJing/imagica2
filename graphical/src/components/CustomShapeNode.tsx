import React, { useCallback } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import TextToShape from './TextToShape';
import style from "./CustomShapeNode.module.scss"
import { useNodeStore } from '../store/nodeStore';
// 新增的转换函数
const convertItineraryToShapeData = (itinerary: any) => {
  return {
    id: itinerary.tripName,
    title: `${itinerary.tripName}\n${itinerary.duration}`,
    shapeType: 'rectangle',
    isVisible: true,
    layer: 0,
    x: 0,
    y: 0,
    zIndex: 0,
    color: '#4a90e2',
    fontSize: 16,
    fontFamily: 'Arial',
    centerText: itinerary.duration,
    width: 360,  // 手机屏幕宽度
    height: 640, // 手机屏幕高度
    backgroundColor: '#ffffff',
    borderColor: '#4a90e2',
    borderWidth: 2,
    itinerary: itinerary,
  };
};

const CustomShapeNode: React.FC<NodeProps> = ({ data, id }) => {
  const { setNodes } = useReactFlow();
  const { selectedNodeId, setSelectedNodeId } = useNodeStore();

  const shapeData = convertItineraryToShapeData(data.itinerary);

  const isSelected = id === selectedNodeId;

  const onNodeClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isSelected) {
      // 如果已经选中，则取消选中
      setSelectedNodeId(null);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: false,
          draggable: true,
          connectable: true,
        }))
      );
    } else {
      // 如果未选中，则选中当前节点
      setSelectedNodeId(id);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === id,
          draggable: node.id !== id,
          connectable: node.id !== id,
        }))
      );
    }
  }, [id, isSelected, setSelectedNodeId, setNodes]);

  return (
    <div
      className={`${style.node} ${isSelected ? style.selected : ''}`}
      onClick={onNodeClick}
    >
      <TextToShape data={shapeData} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomShapeNode;
