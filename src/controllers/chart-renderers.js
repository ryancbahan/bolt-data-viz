class BarChartRenderer {
  createScales(width, height, data, orientation = 'vertical') {
    const allLabels = [...new Set(data.flatMap(series => 
      series.data.map(d => d.label)
    ))];

    const maxValue = Math.max(...data.flatMap(series => 
      series.data.map(d => d.value)
    ));

    if (orientation === 'vertical') {
      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(allLabels)
        .padding(0.1);

      const xGroupScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, xScale.bandwidth()])
        .padding(0.05);

      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxValue * 1.1]);

      return { xScale, xGroupScale, yScale };
    } else {
      const yScale = d3.scaleBand()
        .range([0, height])
        .domain(allLabels)
        .padding(0.1);

      const yGroupScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, yScale.bandwidth()])
        .padding(0.05);

      const xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, maxValue * 1.1]);

      return { xScale, yScale, yGroupScale };
    }
  }

  render(svg, width, height, scales, data, orientation = 'vertical') {
    const defaultColors = d3.schemeCategory10;

    if (orientation === 'vertical') {
      const { xScale, xGroupScale, yScale } = scales;

      const groups = svg.selectAll('.bar-group')
        .data(xScale.domain())
        .enter().append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(${xScale(d)},0)`);

      data.forEach((series, i) => {
        const color = series.style?.color || defaultColors[i];
        
        groups.selectAll(`.bar-${i}`)
          .data(d => {
            const match = series.data.find(item => item.label === d);
            return match ? [{ series, value: match.value, label: d }] : [];
          })
          .enter().append('rect')
          .attr('class', `bar-${i}`)
          .attr('x', () => xGroupScale(series.name))
          .attr('width', xGroupScale.bandwidth())
          .attr('y', d => yScale(d.value))
          .attr('height', d => height - yScale(d.value))
          .attr('fill', color)
          .on('mouseover', function(event, d) {
            d3.select(this).attr('fill', d3.color(color).darker());
            d3.select('.chart-tooltip')
              .style('opacity', 1)
              .html(`${d.series.name}<br>${d.label}: ${d.value}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('fill', color);
            d3.select('.chart-tooltip').style('opacity', 0);
          });
      });
    } else {
      // Horizontal bar chart rendering
      const { xScale, yScale, yGroupScale } = scales;

      const groups = svg.selectAll('.bar-group')
        .data(yScale.domain())
        .enter().append('g')
        .attr('class', 'bar-group')
        .attr('transform', d => `translate(0,${yScale(d)})`);

      data.forEach((series, i) => {
        const color = series.style?.color || defaultColors[i];

        groups.selectAll(`.bar-${i}`)
          .data(d => {
            const match = series.data.find(item => item.label === d);
            return match ? [{ series, value: match.value, label: d }] : [];
          })
          .enter().append('rect')
          .attr('class', `bar-${i}`)
          .attr('y', () => yGroupScale(series.name))
          .attr('height', yGroupScale.bandwidth())
          .attr('x', 0)
          .attr('width', d => xScale(d.value))
          .attr('fill', color)
          .on('mouseover', function(event, d) {
            d3.select(this).attr('fill', d3.color(color).darker());
            d3.select('.chart-tooltip')
              .style('opacity', 1)
              .html(`${d.series.name}<br>${d.label}: ${d.value}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('fill', color);
            d3.select('.chart-tooltip').style('opacity', 0);
          });
      });
    }
  }
}

class LineChartRenderer {
  createScales(width, height, data, orientation = 'vertical') {
    const allLabels = [...new Set(data.flatMap(series => 
      series.data.map(d => d.label)
    ))];

    const maxValue = Math.max(...data.flatMap(series => 
      series.data.map(d => d.value)
    ));

    if (orientation === 'vertical') {
      const xScale = d3.scalePoint()
        .range([0, width])
        .domain(allLabels);

      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxValue * 1.1]);

      return { xScale, yScale };
    } else {
      const yScale = d3.scalePoint()
        .range([0, height])
        .domain(allLabels);

      const xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, maxValue * 1.1]);

      return { xScale, yScale };
    }
  }

  render(svg, width, height, scales, data, orientation = 'vertical') {
    const defaultColors = d3.schemeCategory10;

    // Add vertical highlight line (initially hidden)
    const verticalLine = svg.append('line')
      .attr('class', 'vertical-highlight')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const line = orientation === 'vertical'
      ? d3.line()
          .x(d => scales.xScale(d.label))
          .y(d => scales.yScale(d.value))
          .curve(d3.curveMonotoneX)
      : d3.line()
          .x(d => scales.xScale(d.value))
          .y(d => scales.yScale(d.label))
          .curve(d3.curveMonotoneX);

    const area = orientation === 'vertical'
      ? d3.area()
          .x(d => scales.xScale(d.label))
          .y0(height)
          .y1(d => scales.yScale(d.value))
          .curve(d3.curveMonotoneX)
      : d3.area()
          .x0(0)
          .x1(d => scales.xScale(d.value))
          .y(d => scales.yScale(d.label))
          .curve(d3.curveMonotoneX);

    // Create vertical slices for hover detection
    const verticalSlices = svg.append('g')
      .attr('class', 'vertical-slices')
      .style('pointer-events', 'all');

    const uniqueLabels = [...new Set(data[0].data.map(d => d.label))];
    const sliceWidth = width / (uniqueLabels.length - 1);

    uniqueLabels.forEach((label, i) => {
      verticalSlices.append('rect')
        .attr('x', scales.xScale(label) - sliceWidth / 2)
        .attr('y', 0)
        .attr('width', sliceWidth)
        .attr('height', height)
        .style('fill', 'transparent')
        .style('pointer-events', 'all')
        .datum(label);
    });

    // Store all dots for later reference
    const dots = [];
    const allDataPoints = [];

    data.forEach((series, i) => {
      const color = series.style?.color || defaultColors[i];
      
      // Add gradient if specified
      if (series.style?.gradient) {
        const gradientId = `line-gradient-${i}`;
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '0%')
          .attr('y2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.4);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0);

        // Add area with gradient
        svg.append('path')
          .datum(series.data)
          .attr('fill', `url(#${gradientId})`)
          .attr('d', area);
      }

      // Add line
      svg.append('path')
        .datum(series.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', series.style?.stroke === 'dashed' ? '5,5' : 'none')
        .attr('d', line);

      // Add dots
      const seriesDots = svg.selectAll(`.dot-${i}`)
        .data(series.data)
        .enter().append('circle')
        .attr('class', `dot-${i}`)
        .attr('cx', d => orientation === 'vertical' ? scales.xScale(d.label) : scales.xScale(d.value))
        .attr('cy', d => orientation === 'vertical' ? scales.yScale(d.value) : scales.yScale(d.label))
        .attr('r', 4)
        .attr('fill', color)
        .style('opacity', 1);

      // Store dots and data points for this series
      series.data.forEach((d, j) => {
        const dot = seriesDots.nodes()[j];
        dots.push(dot);
        allDataPoints.push({
          x: orientation === 'vertical' ? scales.xScale(d.label) : scales.xScale(d.value),
          y: orientation === 'vertical' ? scales.yScale(d.value) : scales.yScale(d.label),
          data: d,
          series,
          color,
          dot,
          label: d.label
        });
      });
    });

    // Handle mouse events on vertical slices
    verticalSlices.selectAll('rect').on('mousemove', function(event) {
      const label = d3.select(this).datum();
      const points = allDataPoints.filter(p => p.label === label);
      
      // Reset all dots
      dots.forEach(dot => {
        d3.select(dot)
          .attr('r', 4)
          .style('fill', d => {
            const pointData = allDataPoints.find(p => p.dot === dot);
            return pointData ? pointData.color : null;
          });
      });

      // Highlight dots for this label
      points.forEach(point => {
        d3.select(point.dot)
          .attr('r', 6)
          .style('fill', d3.color(point.color).darker());
      });

      // Update vertical line
      if (orientation === 'vertical') {
        verticalLine
          .attr('x1', scales.xScale(label))
          .attr('x2', scales.xScale(label))
          .style('opacity', 1);
      }

      // Show tooltip with all values for this label
      const tooltipContent = points
        .map(p => `${p.series.name}: ${p.data.value}`)
        .join('<br>');
      
      d3.select('.chart-tooltip')
        .style('opacity', 1)
        .html(`${label}<br>${tooltipContent}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    });

    verticalSlices.selectAll('rect').on('mouseleave', function() {
      // Reset everything when mouse leaves a slice
      dots.forEach(dot => {
        d3.select(dot)
          .attr('r', 4)
          .style('fill', d => {
            const pointData = allDataPoints.find(p => p.dot === dot);
            return pointData ? pointData.color : null;
          });
      });
      verticalLine.style('opacity', 0);
      d3.select('.chart-tooltip').style('opacity', 0);
    });
  }
}

export { BarChartRenderer, LineChartRenderer };