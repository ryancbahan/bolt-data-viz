const { Controller } = Stimulus;

import { BaseChartController } from './base-chart-controller.js';

export class LineChartController extends BaseChartController {
  initialize() {
    this._data = [
      { date: new Date('2024-01-01'), value: 10 },
      { date: new Date('2024-02-01'), value: 15 },
      { date: new Date('2024-03-01'), value: 13 },
      { date: new Date('2024-04-01'), value: 17 },
      { date: new Date('2024-05-01'), value: 20 },
    ];
  }

  createScales(width, height) {
    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(this.data, d => d.date));

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(this.data, d => d.value)]);

    return { xScale, yScale };
  }

  renderChartContent(svg, width, height) {
    const { xScale, yScale } = this.createScales(width, height);

    // Add line
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 4)
      .attr('fill', '#3B82F6')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('fill', '#2563EB');
        d3.select('.chart-tooltip')
          .style('opacity', 1)
          .html(`Value: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 4)
          .attr('fill', '#3B82F6');
        d3.select('.chart-tooltip').style('opacity', 0);
      });
  }

  get xAxisLabel() {
    return 'Date';
  }

  get yAxisLabel() {
    return 'Values';
  }
}