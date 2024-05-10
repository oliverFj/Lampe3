// uiManager.js

import ColorChangeVisualization from './colorChangeVisualization.js';
import CircleVisualization from './circleVisualization.js';
import ColorWaveVisualization from './colorWaveVisualization.js';


export default class UIManager {
    constructor(dataManager, p) {
 
        this.dataManager = dataManager;
        this.p = p;
        this.visualizations = {
            0: new ColorChangeVisualization(p, dataManager),
            1: new CircleVisualization(p, dataManager)
           // 2: new ColorWaveVisualization(p, dataManager)
        };
        this.currentVisualization = this.visualizations[0];
        this.visualizationMode = 0;
    }

    draw() {

        this.currentVisualization.draw();
    }

    toggleVisualization() {
        let nextVisualization = (this.visualizationMode + 1) % Object.keys(this.visualizations).length;

        this.visualizationMode = nextVisualization;
        this.currentVisualization = this.visualizations[nextVisualization];
    }

    setupCanvas() {
        console.log("Setting up canvas");
        this.p.background(0);
    }

}

