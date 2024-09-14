import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface ShapeData {
  text: string;
  shapeType: 'circle' | 'rectangle' | 'triangle';
  layer: number;
  id: string;
  width?: number;
  height?: number;
}

interface TextToShapeProps {
  data: ShapeData;
  isThumb?: boolean;
}

const TextToShape: React.FC<TextToShapeProps> = ({ data, isThumb = false }) => {
  const { text, shapeType } = data;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const randomValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) / text.length;

    const scaleFactor = isThumb ? 0.2 : 1; // 缩略图缩小到原来的 20%
    const baseSize = 100 * scaleFactor;
    let shapeWidth = baseSize;
    let shapeHeight = baseSize;

    const group = svg.append('g');

    switch (shapeType) {
      case 'circle':
        const radius = baseSize / 2;
        group.append('circle')
          .attr('cx', radius)
          .attr('cy', radius)
          .attr('r', radius)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
      case 'rectangle':
        group.append('rect')
          .attr('width', baseSize)
          .attr('height', baseSize)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
      case 'triangle':
        group.append('path')
          .attr('d', `M${baseSize/2},0 L${baseSize},${baseSize} L0,${baseSize} Z`)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
    }

    if (!isThumb) {
      const textElement = group.append('text')
        .attr('x', baseSize / 2)
        .attr('y', baseSize + 20 * scaleFactor)
        .attr('text-anchor', 'middle')
        .attr('font-size', `${12 * scaleFactor}px`)
        .text(text);

      const textBBox = (textElement.node() as SVGTextElement).getBBox();
      shapeWidth = Math.max(baseSize, textBBox.width);
      shapeHeight = baseSize + textBBox.height + 25 * scaleFactor;
    }

    const padding = 10 * scaleFactor;
    const svgWidth = shapeWidth + padding * 2;
    const svgHeight = shapeHeight + padding * 2;

    svg.attr('width', svgWidth)
       .attr('height', svgHeight)
       .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    // 居中定位
    const centerX = (svgWidth - shapeWidth) / 2;
    const centerY = (svgHeight - shapeHeight) / 2;
    group.attr('transform', `translate(${centerX}, ${centerY})`);

    setDimensions({ width: svgWidth, height: svgHeight });
  }, [data, isThumb]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions.width} 
      height={dimensions.height}
      style={{ overflow: 'visible' }}
    />
  );
};

export default TextToShape;