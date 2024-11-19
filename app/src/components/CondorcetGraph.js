import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';

const CondorcetGraph = forwardRef(({ medians, columns }, ref) => {
  const svgRef = useRef();

  useImperativeHandle(ref, () => ({
    exportAsImage() {
      if (svgRef.current) {
        const svgElement = svgRef.current;

        // Export dimensions
        const bbox = svgElement.getBBox();
        const padding = 20;
        const width = bbox.width + padding * 2;
        const height = bbox.height + padding * 2;

        // Update SVG for export
        svgElement.setAttribute('width', width);
        svgElement.setAttribute('height', height);
        svgElement.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);

        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'graph.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Restore original dimensions
        URL.revokeObjectURL(url);
      }
    },
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

    // Convert columns to a node mapping
    const nodePositions = columns
      .filter(column => column.name !== 'Coefficient') // Exclude Coefficient
      .map((candidate, index) => {
        const angle = (index * 2 * Math.PI) / (columns.length);
        return {
          id: candidate.id,
          name: candidate.name,
          x: centerX + innerRadius * Math.cos(angle),
          y: centerY + innerRadius * Math.sin(angle),
          labelX: centerX + labelRadius * Math.cos(angle),
          labelY: centerY + labelRadius * Math.sin(angle),
        };
      });

    // Define arrow marker
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
      .attr('fill', 'green');

    // Scaling for edge thickness
    const maxDifference = Math.max(
      ...Object.values(medians).map(val => Math.abs(val))
    );
    const thicknessScale = d3.scaleLinear()
      .domain([0, maxDifference])
      .range([1, 6]);

    // Draw edges
    nodePositions.forEach(source => {
      nodePositions.forEach(target => {
        if (source.id !== target.id) {
          const medianValue = medians[`${source.id}-${target.id}`];
          if (medianValue !== undefined) {
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
            if (medianValue < 0) {
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
              .attr('marker-end', medianValue !== 0 ? 'url(#arrowhead)' : null);

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

    // Draw nodes
    svg.selectAll('circle')
      .data(nodePositions)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 10)
      .attr('fill', 'lightblue')
      .attr('id', d => `node-${d.id}`);

    // Draw labels
    svg.selectAll('text.node-label')
      .data(nodePositions)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => d.labelX)
      .attr('y', d => d.labelY)
      .attr('text-anchor', d => (d.labelX > centerX ? 'start' : 'end'))
      .attr('alignment-baseline', d => (d.labelY > centerY ? 'hanging' : 'baseline'))
      .text(d => d.name) // Use `name` for labels
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
