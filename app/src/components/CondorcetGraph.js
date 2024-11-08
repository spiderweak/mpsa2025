// src/components/CondorcetGraph.js

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';

const CondorcetGraph = forwardRef(({ medians, columns }, ref) => {
  const svgRef = useRef();

  useImperativeHandle(ref, () => ({
    exportAsImage() {
      if (svgRef.current) {
        const svgElement = svgRef.current;
        
        // Save original SVG dimensions
        const originalWidth = svgElement.getAttribute('width');
        const originalHeight = svgElement.getAttribute('height');
        const originalViewBox = svgElement.getAttribute('viewBox');

        // Calculate new dimensions with padding
        const bbox = svgElement.getBBox();
        const padding = 20;
        const width = bbox.width + padding * 2;
        const height = bbox.height + padding * 2;

        // Set new dimensions for export
        svgElement.setAttribute('width', width);
        svgElement.setAttribute('height', height);
        svgElement.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);

        // Serialize and export the SVG
        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'graph.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Revoke URL and restore original dimensions
        URL.revokeObjectURL(url);
        svgElement.setAttribute('width', originalWidth);
        svgElement.setAttribute('height', originalHeight);
        svgElement.setAttribute('viewBox', originalViewBox);
      }
    }
  }));

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const container = svgRef.current.getBoundingClientRect();
    const width = container.width;
    const height = container.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const innerRadius = Math.min(width, height) / 3;
    const labelRadius = innerRadius + 25;

    const angleStep = (2 * Math.PI) / columns.length;
    const nodePositions = columns.map((candidate, index) => {
      const angle = index * angleStep;
      return {
        id: candidate,
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle),
        labelX: centerX + labelRadius * Math.cos(angle),
        labelY: centerY + labelRadius * Math.sin(angle),
      };
    });

    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', '10')
      .attr('refY', '5')
      .attr('markerWidth', '6')
      .attr('markerHeight', '6')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', 'gray');

    const maxDifference = Math.max(
      ...Object.values(medians).map(val => Math.abs(val))
    );
    const thicknessScale = d3.scaleLinear()
      .domain([0, maxDifference])
      .range([1, 6]);

    columns.forEach(candidateA => {
      columns.forEach(candidateB => {
        if (candidateA !== candidateB) {
          const medianValue = medians[`${candidateA}-${candidateB}`];
          if (medianValue !== undefined) {
            const source = nodePositions.find(node => node.id === candidateA);
            const target = nodePositions.find(node => node.id === candidateB);
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const angle = Math.atan2(dy, dx);
            const arrowOffset = 15;

            let x1 = source.x + arrowOffset * Math.cos(angle);
            let y1 = source.y + arrowOffset * Math.sin(angle);
            let x2 = target.x - arrowOffset * Math.cos(angle);
            let y2 = target.y - arrowOffset * Math.sin(angle);

            const absValue = Math.abs(medianValue);
            const strokeWidth = thicknessScale(absValue);
            let color = 'green';
            if (medianValue > 0) {
              [x1, y1, x2, y2] = [x2, y2, x1, y1];
            } else if (medianValue === 0) {
              color = 'gray';
            }

            svg.append('line')
              .attr('x1', x1)
              .attr('y1', y1)
              .attr('x2', x2)
              .attr('y2', y2)
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('marker-end', 'url(#arrowhead)');

            const textX = x1 + 0.25 * (x2 - x1);
            const textY = y1 + 0.25 * (y2 - y1);
            const offsetX = 20 * Math.cos(angle - Math.PI / 2);
            const offsetY = 20 * Math.sin(angle - Math.PI / 2);

            svg.append('text')
              .attr('x', textX + offsetX)
              .attr('y', textY + offsetY)
              .attr('text-anchor', 'middle')
              .attr('alignment-baseline', 'middle')
              .attr('font-size', '15px')
              .attr('fill', 'black')
              .text(absValue.toFixed(2));
          }
        }
      });
    });

    svg.selectAll('circle')
      .data(nodePositions)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 10)
      .attr('fill', 'lightblue')
      .attr('id', d => `node-${d.id}`);

    svg.selectAll('text.node-label')
      .data(nodePositions)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => d.labelX)
      .attr('y', d => d.labelY)
      .attr('text-anchor', d => (d.labelX > centerX ? 'start' : 'end'))
      .attr('alignment-baseline', d => (d.labelY > centerY ? 'hanging' : 'baseline'))
      .text(d => d.id)
      .attr('font-size', '24px')
      .attr('fill', 'black');

  }, [medians, columns]);

  return (
    <div className="svg-container">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
});

export default CondorcetGraph;
