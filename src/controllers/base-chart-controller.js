const { Controller } = Stimulus;
import { BarChartRenderer, LineChartRenderer } from './chart-renderers.js';

export class BaseChartController extends Controller {
  static targets = ['container'];
  static values = {
    type: String,
    data: Array,
    orientation: { type: String, default: 'vertical' }
  };

  constructor(...args) {
    super(...args);
    this.resizeObserver = new ResizeObserver(() => {
      if (this.containerTarget) {
        this.renderChart();
      }
    });
  }

  connect() {
    if (this.containerTarget) {
      this.resizeObserver.observe(this.containerTarget);
      this.renderChart();
    }
  }

  disconnect() {
    if (this.containerTarget) {
      this.resizeObserver.unobserve(this.containerTarget);
    }
    this.resizeObserver.disconnect();
  }

  dataValueChanged() {
    this.renderChart();
  }

  orientationValueChanged() {
    this.renderChart();
  }

  get chartType() {
    return this.typeValue || 'bar';
  }

  calculateMargins() {
    // Get the longest label
    const allLabels = this.dataValue.flatMap(series => 
      series.data.map(d => d.label)
    );
    
    // Create temporary text element to measure text width
    const svg = d3.select(this.containerTarget)
      .append('svg')
      .attr('visibility', 'hidden');
      
    const text = svg.append('text')
      .style('font-size', '12px')
      .text(allLabels.reduce((a, b) => a.length > b.length ? a : b));
    
    const textWidth = text.node().getBBox().width;
    svg.remove();

    // Calculate legend height based on number of items and available width
    const legendHeight = this.calculateLegendHeight(this.containerTarget.clientWidth);
    const xAxisHeight = 20;
    const legendSpacing = 15;

    return {
      top: 20,
      right: 20,
      bottom: legendHeight + xAxisHeight + legendSpacing,
      left: this.orientationValue === 'horizontal' ? textWidth + 10 : 50
    };
  }

  calculateLegendHeight(containerWidth) {
    const itemWidth = 100; // Base width for each legend item
    const itemHeight = 20; // Height of each legend item
    const itemsPerRow = Math.floor(containerWidth / itemWidth);
    const rows = Math.ceil(this.dataValue.length / itemsPerRow);
    return rows * itemHeight;
  }

  getVisibleLabels(allLabels, availableWidth) {
    const minSpaceBetweenLabels = 60;
    const maxLabels = Math.floor(availableWidth / minSpaceBetweenLabels);
    
    if (allLabels.length <= maxLabels) {
      return allLabels;
    }

    const visibleLabels = new Set([allLabels[0], allLabels[allLabels.length - 1]]);
    const step = Math.ceil(allLabels.length / (maxLabels - 1));
    
    for (let i = step; i < allLabels.length - 1; i += step) {
      visibleLabels.add(allLabels[i]);
    }

    return Array.from(visibleLabels);
  }

  renderChart() {
    if (!this.containerTarget || !this.dataValue?.length) return;

    const containerWidth = this.containerTarget.clientWidth;
    const containerHeight = this.containerTarget.clientHeight;

    d3.select(this.containerTarget).selectAll('*').remove();

    const margin = this.calculateMargins();
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(this.containerTarget)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    const chartArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allLabels = [...new Set(this.dataValue.flatMap(series => 
      series.data.map(d => d.label)
    ))];

    const visibleLabels = this.getVisibleLabels(allLabels, width);
    const scales = this.setupAxes(chartArea, width, height, visibleLabels);

    const renderer = this.getChartRenderer();
    if (renderer) {
      renderer.render(chartArea, width, height, scales, this.dataValue, this.orientationValue);
    }

    this.addLegend(svg, width, height, margin, containerWidth);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', 0);

    return { svg, width, height, tooltip };
  }

  addLegend(svg, width, height, margin, containerWidth) {
    const itemWidth = 100; // Base width for each legend item
    const itemHeight = 20; // Height of each legend item
    const itemsPerRow = Math.floor(containerWidth / itemWidth);
    
    const legend = svg.append('g')
      .attr('class', 'legend');

    this.dataValue.forEach((series, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      const x = margin.left + (col * itemWidth);
      const y = height + margin.top + 35 + (row * itemHeight);

      const legendItem = legend.append('g')
        .attr('transform', `translate(${x}, ${y})`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', d3.schemeCategory10[i]);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .text(series.name)
        .style('font-size', '12px')
        .each(function() {
          // Truncate text if it's too long
          const textWidth = this.getComputedTextLength();
          if (textWidth > itemWidth - 20) {
            const text = d3.select(this);
            let textContent = text.text();
            while (textContent.length > 3 && this.getComputedTextLength() > itemWidth - 20) {
              textContent = textContent.slice(0, -1);
              text.text(textContent + '...');
            }
          }
        });
    });
  }

  setupAxes(svg, width, height, visibleLabels) {
    const scales = this.getChartRenderer().createScales(width, height, this.dataValue, this.orientationValue);
    const { xScale, yScale } = scales;

    if (this.orientationValue === 'vertical') {
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => visibleLabels.includes(d) ? d : '');

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'x-axis')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));
    } else {
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'x-axis')
        .call(d3.axisBottom(xScale).ticks(5));

      const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => visibleLabels.includes(d) ? d : '');

      svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    }

    return scales;
  }

  getChartRenderer() {
    switch (this.chartType) {
      case 'line':
        return new LineChartRenderer();
      case 'bar':
      default:
        return new BarChartRenderer();
    }
  }
}