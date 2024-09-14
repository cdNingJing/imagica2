import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useCanvas } from '../store/CanvasStore';
import { useShapeStore, ShapeData } from '../store/ShapeStore'; // 修改这行
import TextToShape from './TextToShape';
import DraggableComponent from './DraggableComponent';
import ShapeThumbnail from './ShapeThumbnail';  // 添加这行

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

const ClockCanvasContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  cursor: move;
`;

const Canvas: React.FC = () => {
  const { items, updateItemPosition } = useCanvas();
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore(); // 使用 useShapeStore
  const [clockPosition, setClockPosition] = useState({ x: 20, y: 20 });
  const clockCanvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ id: string; startX: number; startY: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedItem) {
      const newX = e.clientX - draggedItem.startX;
      const newY = e.clientY - draggedItem.startY;
      if (draggedItem.id === 'clock') {
        setClockPosition({ x: newX, y: newY });
      } else {
        updateItemPosition(draggedItem.id, newX, newY);
      }
    }
  }, [draggedItem, updateItemPosition]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const drawClock = useCallback((time: string) => {
    const canvas = clockCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制时钟外圈
    ctx.beginPath();
    ctx.arc(150, 150, 140, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制时间文字
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(time, 150, 220);

    // 绘制时钟指针
    const [hours, minutes] = time.split(':').map(Number);
    
    // 时针
    const hourAngle = (hours % 12 + minutes / 60) * 30 * Math.PI / 180;
    drawHand(ctx, 150, 150, 60, hourAngle, 6);

    // 分针
    const minuteAngle = minutes * 6 * Math.PI / 180;
    drawHand(ctx, 150, 150, 90, minuteAngle, 4);
  }, []);

  const drawHand = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    angle: number,
    width: number
  ) => {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.moveTo(x, y);
    ctx.lineTo(x + length * Math.sin(angle), y - length * Math.cos(angle));
    ctx.stroke();
  };

  useEffect(() => {
    // 这里应该从某处获取时间数据，比如从 store 或 props
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    drawClock(currentTime);

    // 可以设置一个定时器来更新时钟
    const timer = setInterval(() => {
      const newTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      drawClock(newTime);
    }, 60000);

    return () => clearInterval(timer);
  }, [drawClock]);

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

  return (
    <CanvasContainer
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <DraggableComponent
        initialX={0}
        initialY={0}
        initialZIndex={999}
        maxZIndex={maxZIndex}
        onDragEnd={() => {}}
        onUpdateZIndex={() => {}}
      >
        <ShapeThumbnail>
          {shapes.map(shape => (
            <TextToShape 
              key={shape.id}
              data={{
                ...shape,
                text: shape.text.substring(0, 10) + (shape.text.length > 10 ? '...' : ''),
                width: (shape.width ?? 100) / 10,
                height: (shape.height ?? 100) / 10
              } as ShapeData}
              isThumb={true}
            />
          ))}
        </ShapeThumbnail>
      </DraggableComponent>
      {shapes.map(shape => (
        <DraggableComponent
          key={shape.id}
          initialX={shape.x}
          initialY={shape.y}
          initialZIndex={shape.zIndex}
          maxZIndex={maxZIndex}
          onDragEnd={(x, y) => handleDragEnd(shape.id, x, y)}
          onUpdateZIndex={(newZIndex) => handleUpdateZIndex(shape.id, newZIndex)}
        >
          <TextToShape 
            data={shape}
          />
        </DraggableComponent>
      ))}
    </CanvasContainer>
  );
};

export default Canvas;