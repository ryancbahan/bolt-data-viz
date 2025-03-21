const { Controller } = Stimulus;

import { BaseChartController } from './base-chart-controller.js';

export class BarChartController extends BaseChartController {
  initialize() {
    this._data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 },
      { category: 'C', value: 15 },
      { category: 'D', value: 25 },
    ];
  }

  createScales(width, height) {
    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(this.data.map(d => d.category))
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(this.data, d => d.value)]);

    return { xScale, yScale };
  }

  renderChartContent(svg, width, height) {
    const { xScale, yScale } = this.createScales(width, height);

    // Add bars
    svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('fill', '#3B82F6')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#2563EB');
        d3.select('.chart-tooltip')
          .style('opacity', 1)
          .html(`Value: ${d.value}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#3B82F6');
        d3.select('.chart-tooltip').style('opacity', 0);
      });
  }

  get xAxisLabel() {
    return 'Categories';
  }

  get yAxisLabel() {
    return 'Values';
  }
}