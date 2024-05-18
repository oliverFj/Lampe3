import Visualization from './visualization.js';
import Gyroscope from './gyroscope.js';

export default class KaleidoscopeVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.segments = 6;
        this.angle = 0;
        this.colors = [];
        this.initColors();
    }

    draw() {
        this.p.clear();
        this.processGyroscopeData();
        this.updateKaleidoscope();
        this.displayKaleidoscope();
        this.displayText();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const alphaMapped = this.p.map(Gyroscope.normalizeData('alpha', device.alpha), 0, 1, 0, this.p.TWO_PI);
            const betaMapped = this.p.map(Gyroscope.normalizeData('beta', device.beta), 0, 1, 6, 12);
            const gammaMapped = this.p.map(Gyroscope.normalizeData('gamma', device.gamma), 0, 1, 0, 255);

            this.angle = alphaMapped;
            this.segments = betaMapped;
            this.colors = this.colors.map((_, i) => this.p.color((gammaMapped + i * 30) % 255, 100, 150));
        });
    }

    initColors() {
        for (let i = 0; i < 12; i++) {
            this.colors.push(this.p.color(i * 30, 100, 150));
        }
    }

    updateKaleidoscope() {
        // Add any additional updates needed for each frame
    }

    displayKaleidoscope() {
        this.p.push();
        this.p.translate(this.p.width / 2, this.p.height / 2);

        for (let i = 0; i < this.segments; i++) {
            this.p.rotate(this.p.TWO_PI / this.segments);
            this.p.push();
            this.p.scale(1, -1);
            this.drawSegment();
            this.p.pop();
            this.drawSegment();
        }

        this.p.pop();
    }

    drawSegment() {
        this.p.fill(this.colors[this.p.frameCount % this.colors.length]);
        this.p.noStroke();
        this.p.beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = this.p.PI / 3 * i;
            let x = this.p.cos(angle) * 100;
            let y = this.p.sin(angle) * 100;
            this.p.vertex(x, y);
        }
        this.p.endShape(this.p.CLOSE);
    }

    displayText() {
        this.p.fill(255);
        this.p.textSize(16);
        this.p.text(`Segments: ${Math.floor(this.segments)}, Angle: ${this.angle.toFixed(2)}`, 20, 30);
    }
}
