import React from 'react';
import { Handle, Position } from 'reactflow';
import TextToShape from './TextToShape';

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

const CustomShapeNode: React.FC<any> = ({ data }) => {
  const shapeData = convertItineraryToShapeData(data.itinerary);

  return (
    <div style={{
      width: '360px',
      height: '640px',
      borderRadius: '3px',
      fontSize: '12px',
      color: '#222',
      textAlign: 'center',
      backgroundColor: 'white',
    }}>
      <TextToShape data={shapeData} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomShapeNode;
