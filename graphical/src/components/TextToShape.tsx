import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface ShapeData {
  text: string;
  shapeType: 'circle' | 'rectangle' | 'triangle' | 'ellipse' | 'pentagon' | 'hexagon' | 'star' | 'diamond' | 'unknown';
  layer: number;
  id: string;
  width?: number;
  height?: number;
  color?: string;
  colors?: string[];
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  x?: number;
  y?: number;
  zIndex?: number;
  size?: number;
  shapes?: ShapeData[];
}

interface TextToShapeProps {
  data: ShapeData;
  isThumb?: boolean;
}

const TextToShape: React.FC<TextToShapeProps> = ({ data, isThumb = false }) => {
  const { text, shapeType, color, colors, fontSize, fontFamily, fontColor, size } = data;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const scaleFactor = isThumb ? 0.2 : 1;
    const baseSize = (size || 100) * scaleFactor;
    let shapeWidth = baseSize;
    let shapeHeight = baseSize;

    const group = svg.append('g');

    const shapeColor = color || (colors && colors[0]) || `hsl(${Math.random() * 360}, 70%, 50%)`;

    const drawShape = () => {
      switch (shapeType) {
        case 'circle':
          const radius = baseSize / 2;
          group.append('circle')
            .attr('cx', radius)
            .attr('cy', radius)
            .attr('r', radius)
            .attr('fill', shapeColor);
          break;
        case 'rectangle':
          group.append('rect')
            .attr('width', baseSize)
            .attr('height', baseSize)
            .attr('fill', shapeColor);
          break;
        case 'triangle':
          group.append('path')
            .attr('d', `M${baseSize/2},0 L${baseSize},${baseSize} L0,${baseSize} Z`)
            .attr('fill', shapeColor);
          break;
        case 'ellipse':
          group.append('ellipse')
            .attr('cx', baseSize / 2)
            .attr('cy', baseSize / 2)
            .attr('rx', baseSize / 2)
            .attr('ry', baseSize / 3)
            .attr('fill', shapeColor);
          break;
        case 'pentagon':
          const pentagonPoints = d3.range(5).map((d) => {
            const angle = (d * 2 * Math.PI) / 5 - Math.PI / 2;
            return [baseSize / 2 + baseSize / 2 * Math.cos(angle), baseSize / 2 + baseSize / 2 * Math.sin(angle)];
          });
          group.append('polygon')
            .attr('points', pentagonPoints.join(' '))
            .attr('fill', shapeColor);
          break;
        case 'hexagon':
          const hexagonPoints = d3.range(6).map((d) => {
            const angle = (d * 2 * Math.PI) / 6;
            return [
              baseSize / 2 + baseSize / 2 * Math.cos(angle),
              baseSize / 2 + baseSize / 2 * Math.sin(angle)
            ];
          });
          group.append('polygon')
            .attr('points', hexagonPoints.join(' '))
            .attr('fill', shapeColor);
          break;
        case 'star':
          const starPoints = d3.range(10).map((d, i) => {
            const angle = (i * 2 * Math.PI) / 10 - Math.PI / 2;
            const radius = i % 2 === 0 ? baseSize / 2 : baseSize / 4;
            return [baseSize / 2 + radius * Math.cos(angle), baseSize / 2 + radius * Math.sin(angle)];
          });
          group.append('polygon')
            .attr('points', starPoints.join(' '))
            .attr('fill', shapeColor);
          break;
        case 'diamond':
          const diamondPoints = [
            [baseSize / 2, 0],
            [baseSize, baseSize / 2],
            [baseSize / 2, baseSize],
            [0, baseSize / 2]
          ];
          group.append('polygon')
            .attr('points', diamondPoints.join(' '))
            .attr('fill', shapeColor);
          break;
        default:
          console.warn(`Unsupported shape type: ${shapeType}`);
      }
    };

    drawShape();

    if (!isThumb) {
      const textElement = group.append('text')
        .attr('x', baseSize / 2)
        .attr('y', baseSize + 20 * scaleFactor)
        .attr('text-anchor', 'middle')
        .attr('font-size', fontSize ? `${fontSize * scaleFactor}px` : `${12 * scaleFactor}px`)
        .attr('font-family', fontFamily || 'sans-serif')
        .attr('fill', fontColor || '#000000')

      const textBBox = (textElement.node() as SVGTextElement)?.getBBox();
      if (textBBox) {
        shapeWidth = Math.max(baseSize, textBBox.width);
        shapeHeight = baseSize + textBBox.height + 25 * scaleFactor;
      }
    }

    const padding = 10 * scaleFactor;
    const svgWidth = shapeWidth + padding * 2;
    const svgHeight = shapeHeight + padding * 2;

    svg.attr('width', svgWidth)
       .attr('height', svgHeight)
       .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    const centerX = (svgWidth - shapeWidth) / 2;
    const centerY = (svgHeight - shapeHeight) / 2;
    group.attr('transform', `translate(${centerX}, ${centerY})`);

    setDimensions({ width: svgWidth, height: svgHeight });
  }, [data, isThumb]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions.width || 0} 
      height={dimensions.height || 0}
      style={{ overflow: 'visible' }}
    />
  );
};

export default TextToShape;