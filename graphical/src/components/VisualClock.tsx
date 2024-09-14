import React, { useEffect, useRef } from 'react';

interface VisualClockProps {
  time: string;
}

const VisualClock: React.FC<VisualClockProps> = ({ time }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
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
  }, [time]);

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

  return <canvas ref={canvasRef} width={300} height={300} />;
};

export default VisualClock;