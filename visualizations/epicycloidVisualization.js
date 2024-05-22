// epicycloidVisualization.js
import Visualization from '../visualization.js';
import Gyroscope from '../gyroscope.js';

export default class EpicycloidVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.points = [];
    }

    setup() {
        this.p.createCanvas(800, 600);
        this.p.frameRate(60);
        this.p.background(250, 250, 250, 250); // Dark gray background
    }

    draw() {
        this.p.background(250, 250, 250, 5); // Slightly transparent background for trailing effect
        this.processGyroscopeData();
        this.drawEpicycloid();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const beta = Gyroscope.normalizeData('beta', device.beta);
            const gamma = Gyroscope.normalizeData('gamma', device.gamma);
            const alpha = Gyroscope.normalizeData('alpha', device.alpha);

            const angle = this.p.frameCount * 0.2;
            const radius = this.p.map(alpha, 0, 1, 50, 400);
            const x = this.p.width / 2 + (radius + 20 * Math.cos(gamma * 2 * Math.PI)) * Math.cos(angle);
            const y = this.p.height / 2 + (radius + 20 * Math.sin(gamma * 2 * Math.PI)) * Math.sin(angle);
            const color = this.getColorForDevice(device.color);

            this.points.push({ x, y, color, alpha });
        });
    }

    getColorForDevice(colorName) {
        switch(colorName) {
            case 'red':
                return this.p.color(255, 0, 0, 150); // Red with transparency
            case 'green':
                return this.p.color(0, 255, 0, 150); // Green with transparency
            case 'blue':
                return this.p.color(0, 0, 255, 150); // Blue with transparency
            default:
                return this.p.color(200, 150); // Default to gray with transparency
        }
    }

    drawEpicycloid() {
        this.p.noFill();
        this.points.forEach((point, index) => {
            const nextPoint = this.points[(index + 1) % this.points.length];
            this.p.stroke(point.color);
            this.p.line(point.x, point.y, nextPoint.x, nextPoint.y);
        });

        // Remove old points to prevent excessive memory usage
        if (this.points.length > 500) {
            this.points.splice(0, this.points.length - 500);
        }
    }
}