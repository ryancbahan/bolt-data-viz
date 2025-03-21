const { Controller } = Stimulus;

export class DataInputController extends Controller {
  static targets = ['series', 'label', 'value'];

  updateData(event) {
    event.preventDefault();
    
    const seriesName = this.seriesTarget.value;
    const label = this.labelTarget.value;
    const value = parseFloat(this.valueTarget.value);

    if (!seriesName || !label || isNaN(value)) {
      alert('Please enter valid data');
      return;
    }

    // Update charts
    ['bar', 'line'].forEach(type => {
      const chart = this.application.getControllerForElementAndIdentifier(
        document.querySelector(`[data-controller="chart"][data-chart-type-value="${type}"]`),
        'chart'
      );
      
      if (chart) {
        const currentData = [...chart.dataValue];
        const seriesIndex = currentData.findIndex(s => s.name === seriesName);
        
        if (seriesIndex === -1) {
          // Create new series
          currentData.push({
            name: seriesName,
            data: [{ label, value }]
          });
        } else {
          // Update existing series
          const labelIndex = currentData[seriesIndex].data.findIndex(d => d.label === label);
          if (labelIndex === -1) {
            currentData[seriesIndex].data.push({ label, value });
          } else {
            currentData[seriesIndex].data[labelIndex].value = value;
          }
        }
        
        chart.dataValue = currentData;
      }
    });

    // Clear form
    this.seriesTarget.value = '';
    this.labelTarget.value = '';
    this.valueTarget.value = '';
  }
}