// uiManager.js
import ColorChangeVisualization from './visualizations/colorChangeVisualization.js';
import CircleVisualization from './visualizations/circleVisualization.js';
import ColorWaveVisualization from './visualizations/colorWaveVisualization.js';
import ThreeCircles from './visualizations/threeCircles.js';
import ColorParticleSystemVisualization from './visualizations/ColorParticleSystemVisualization.js';
import KaleidoscopeVisualization from './visualizations/KaleidoscopeVisualization.js';
import InteractiveColorHarmony from './visualizations/InteractiveColorHarmony.js';
import LinePatternVisualization from './visualizations/VizTest.js';
import EpicycloidVisualization from './visualizations/epicycloidVisualization.js';
//import GyroscopeVectorField from './gyroscopeVecorField.js';  // Correct the filename if necessary

export default class UIManager {
    constructor(dataManager, p) {
        this.dataManager = dataManager;
        this.p = p;
        this.visualizations = {
            0: new ColorChangeVisualization(p, dataManager),
            1: new ColorWaveVisualization(p, dataManager),
            2: new ThreeCircles(p, dataManager),
            3: new LinePatternVisualization(p, dataManager),
            4: new EpicycloidVisualization(p, dataManager)
        };
        this.currentVisualization = this.visualizations[0];
        this.visualizationMode = 0;
    }

    draw() {
        this.currentVisualization.draw();
    }

    nextVisualization() {
        this.visualizationMode = (this.visualizationMode + 1) % Object.keys(this.visualizations).length;
        this.currentVisualization = this.visualizations[this.visualizationMode];
    }

    prevVisualization() {
        this.visualizationMode = (this.visualizationMode - 1 + Object.keys(this.visualizations).length) % Object.keys(this.visualizations).length;
        this.currentVisualization = this.visualizations[this.visualizationMode];
    }

    setupCanvas() {
        console.log("Setting up canvas");
        this.p.background(0);
    }
}


