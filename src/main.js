// Import Stimulus from CDN-loaded global
const application = Stimulus.Application.start();

// Import controllers
import { BarChartController } from './controllers/bar-chart-controller.js';
import { LineChartController } from './controllers/line-chart-controller.js';
import { DataInputController } from './controllers/data-input-controller.js';

// Register controllers
application.register('bar-chart', BarChartController);
application.register('line-chart', LineChartController);
application.register('data-input', DataInputController);