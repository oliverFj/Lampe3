import Visualization from '../visualization.js';

export default class GyroscopeVectorField extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.cols = this.p.width / 40;
        this.rows = this.p.height / 40;
        this.vectors = new Array(this.cols * this.rows);
    }

    setup() {
        // Initialize vectors based on DataManager data
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let index = i * this.cols + j;
                this.vectors[index] = this.p.createVector(0, 0);
            }
        }
    }

    draw() {
        this.p.background(255);
        let colorData = this.dataManager.colorCount;
        let weightData = this.dataManager.colorWeights;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let index = i * this.cols + j;
                let angle = this.p.noise(j * 0.1, i * 0.1) * this.p.TWO_PI;
                let v = this.p5.Vector.fromAngle(angle);
                
                // Adjust vector magnitude based on color weights
                let weight = weightData['red'] * 0.5 + weightData['green'] * 0.5 + weightData['blue'] * 0.5;
                v.setMag(weight);

                this.vectors[index] = v;
                this.drawVector(v, j * 40 - this.p.width / 2, i * 40 - this.p.height / 2, 38);
            }
        }
    }

    drawVector(v, x, y, scale) {
        this.p.push();
        this.p.translate(x, y);
        this.p.stroke(0, 100);
        this.p.rotate(v.heading());
        let length = v.mag() * scale;

        // Color based on the magnitude, mapping through DataManager color data
        let colorIntensity = this.p.map(length, 0, 40, 0, 255);
        this.p.stroke(255, 100, 100, colorIntensity); // Use red intensity as an example
        this.p.line(0, 0, length, 0);
        this.p.pop();
    }
}

// Register the new visualization in UIManager
this.visualizations['gyroVectorField'] = new GyroscopeVectorField(this.p, this.dataManager);
