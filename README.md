# Stimulus Charts

A flexible and reusable charting system built with Stimulus.js and D3.js.

## Features

- 📊 Multiple chart types (bar, line)
- 📱 Responsive design
- 🔄 Real-time updates
- 🎯 Interactive tooltips
- 🎨 Customizable styling

## Quick Start

1. Include the required dependencies in your HTML:

```html
<script src="https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.umd.js"></script>
<script src="https://d3js.org/d3.v7.min.js"></script>
```

2. Create a chart container with the appropriate data attributes:

```html
<div data-controller="chart"
     data-chart-type-value="bar"
     data-chart-data-value='[
       {"label": "A", "value": 10},
       {"label": "B", "value": 20}
     ]'>
  <div data-chart-target="container"></div>
</div>
```

## Data Attributes

### Controller

- `data-controller="chart"`: Initializes the chart controller

### Values

- `data-chart-type-value`: Specifies the chart type (`"bar"` or `"line"`)
- `data-chart-data-value`: JSON string containing the chart data

### Targets

- `data-chart-target="container"`: The container where the chart will be rendered

## Data Format

### Bar Chart

```json
[
  {
    "label": "Category A",
    "value": 10
  }
]
```

### Line Chart

```json
[
  {
    "date": "2024-01-01",
    "value": 10
  }
]
```

## Updating Chart Data

You can update the chart data programmatically:

```javascript
const chart = this.application.getControllerForElementAndIdentifier(
  document.querySelector('[data-controller="chart"]'),
  'chart'
);

chart.dataValue = newData;
```

## Styling

Charts can be styled using CSS. Key classes:

```css
/* Chart container */
[data-controller="chart"] {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

/* Axis styling */
.x-axis,
.y-axis {
  color: #6B7280;
}

/* Tooltip */
.chart-tooltip {
  position: absolute;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
}
```

## Example Implementation

### Bar Chart

```html
<div class="bg-white p-6 rounded-lg shadow-lg h-[400px]"
     data-controller="chart"
     data-chart-type-value="bar"
     data-chart-data-value='[
       {"label": "A", "value": 10},
       {"label": "B", "value": 20},
       {"label": "C", "value": 15},
       {"label": "D", "value": 25}
     ]'>
  <h2 class="text-xl font-semibold mb-4">Sales Data</h2>
  <div data-chart-target="container" class="h-[calc(100%-2rem)]"></div>
</div>
```

### Line Chart

```html
<div class="bg-white p-6 rounded-lg shadow-lg h-[400px]"
     data-controller="chart"
     data-chart-type-value="line"
     data-chart-data-value='[
       {"date": "2024-01-01", "value": 10},
       {"date": "2024-02-01", "value": 15},
       {"date": "2024-03-01", "value": 13}
     ]'>
  <h2 class="text-xl font-semibold mb-4">Trend Analysis</h2>
  <div data-chart-target="container" class="h-[calc(100%-2rem)]"></div>
</div>
```

## Architecture

The charting system uses a modular architecture:

- `BaseChartController`: Handles common chart functionality
- `BarChartRenderer`: Renders bar charts
- `LineChartRenderer`: Renders line charts

### Adding New Chart Types

1. Create a new renderer class implementing `createScales` and `render` methods
2. Add the renderer to the `getChartRenderer` method in `BaseChartController`

## Features

### Automatic Resizing

Charts automatically resize when their container size changes, thanks to the ResizeObserver API.

### Interactive Tooltips

All charts include interactive tooltips that show data values on hover.

### Real-time Updates

Charts automatically update when their data changes through Stimulus value observers.

## Browser Support

- Modern browsers supporting ES6+
- Requires ResizeObserver API support