// circleVisualization.js
import Visualization from './visualization.js';

export default class CircleVisualization extends Visualization {
    draw() {
        
        this.p.background(0);
        this.p.fill(255);
        this.p.noStroke();

        let totalBeta = 0;
        let deviceCount = 0;
        Object.values(this.dataManager.devices).forEach(device => {
            if (device.beta !== undefined) {
                totalBeta += this.dataManager.calculateWeight(device.beta);
                deviceCount++;
            }
        });

        let averageBeta = deviceCount > 0 ? totalBeta / deviceCount : 0;
        let circleSize = this.p.map(averageBeta, 0, 1, 50, 450);
        this.p.ellipse(this.p.width / 2, this.p.height / 2, circleSize, circleSize);
    }
}
