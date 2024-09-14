import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TextToShapeProps {
  text: string;
  shapeType: 'circle' | 'rectangle' | 'triangle';
}

const TextToShape: React.FC<TextToShapeProps> = ({ text, shapeType }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const randomValue = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) / text.length;

    let shapeWidth = 0;
    let shapeHeight = 0;

    const group = svg.append('g');

    switch (shapeType) {
      case 'circle':
        const radius = randomValue % 50 + 20;
        shapeWidth = shapeHeight = radius * 2;
        group.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', radius)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
      case 'rectangle':
        shapeWidth = randomValue % 100 + 50;
        shapeHeight = randomValue % 80 + 40;
        group.append('rect')
          .attr('x', -shapeWidth / 2)
          .attr('y', -shapeHeight / 2)
          .attr('width', shapeWidth)
          .attr('height', shapeHeight)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
      case 'triangle':
        const triangleSize = randomValue % 80 + 40;
        shapeWidth = shapeHeight = triangleSize;
        group.append('path')
          .attr('d', `M0,${-triangleSize/2} L${triangleSize/2},${triangleSize/2} L${-triangleSize/2},${triangleSize/2} Z`)
          .attr('fill', `hsl(${randomValue % 360}, 70%, 50%)`);
        break;
    }

    const textElement = group.append('text')
      .attr('x', 0)
      .attr('y', shapeHeight / 2 + 20)
      .attr('text-anchor', 'middle')
      .text(text);

    const textBBox = (textElement.node() as SVGTextElement).getBBox();
    const totalWidth = Math.max(shapeWidth, textBBox.width);
    const totalHeight = shapeHeight + textBBox.height + 25;

    const padding = 10;
    const scaleFactor = 1.05;
    const svgWidth = totalWidth * scaleFactor + padding * 2;
    const svgHeight = totalHeight * scaleFactor + padding * 2;

    setDimensions({ width: svgWidth, height: svgHeight });

    group.attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`);

    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    filter.append('feFlood')
      .attr('flood-color', '#cccccc')
      .attr('flood-opacity', 0.5)
      .attr('result', 'coloredShadow');

    filter.append('feComposite')
      .attr('in', 'coloredShadow')
      .attr('in2', 'offsetBlur')
      .attr('operator', 'in')
      .attr('result', 'coloredShadowBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredShadowBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

  }, [text, shapeType]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.select('g')
      .transition()
      .duration(200)
      .attr('transform', isHovered 
        ? `translate(${dimensions.width / 2}, ${dimensions.height / 2}) scale(1.05)` 
        : `translate(${dimensions.width / 2}, ${dimensions.height / 2})`)
      .style('filter', isHovered ? 'url(#drop-shadow)' : 'none');
  }, [isHovered, dimensions]);

  return (
    <svg 
      ref={svgRef} 
      width={dimensions.width} 
      height={dimensions.height}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    ></svg>
  );
};

export default TextToShape;