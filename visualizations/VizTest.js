// VizTest.js
import Visualization from '../visualization.js';

export default class LinePatternVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.lines = [];
    }

    setup() {
        this.p.createCanvas(800, 600);
        this.p.background(30);
    }

    draw() {
        this.processGyroscopeData();
        this.updateLines();
        this.displayLines();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const betaMapped = this.p.map(this.normalizeData('beta', device.beta), 0, 1, this.p.height, 0);
            const gammaMapped = this.p.map(this.normalizeData('gamma', device.gamma), 0, 1, 0, this.p.width);
            const alphaMapped = this.p.map(this.normalizeData('alpha', device.alpha), 0, 1, 1, 5);

            const deviceColor = this.getColorForDevice(device.color);

            this.lines.push(new Line(this.p, gammaMapped, betaMapped, deviceColor, alphaMapped));
        });
    }

    normalizeData(type, value) {
        switch (type) {
            case 'beta':
            case 'gamma':
                let capped = Math.min(Math.max(value, -90), 90);
                return (capped + 90) / 180;
            case 'alpha':
                return value / 360;
            default:
                console.error("Invalid type for normalization");
                return 0;
        }
    }

    getColorForDevice(colorName) {
        switch (colorName) {
            case 'red':
                return this.p.color(255, 0, 0, 20);
            case 'green':
                return this.p.color(0, 255, 0, 20);
            case 'blue':
                return this.p.color(0, 0, 255, 20);
            default:
                return this.p.color(200, 200);
        }
    }

    updateLines() {
        this.lines.forEach(line => line.update());
        this.lines = this.lines.filter(line => line.isActive());
    }

    displayLines() {
        this.p.clear();
       // this.p.background(250, 250, 250, 5);
        this.lines.forEach(line => line.display());
    }
}

class Line {
    constructor(p, x, y, color, weight) {
        this.p = p;
        this.points = [{ x, y }];
        this.color = color;
        this.weight = weight * 20;
        this.maxLength = 100; 
        this.branchProbability = 0.0005; 
    }

    isActive() {
        return this.points.length < this.maxLength;
    }

    update() {
        const lastPoint = this.points[this.points.length - 1];
        const angle = this.p.random(this.p.TWO_PI);

        // Smooth movement
        const stepSize = this.weight * 0.8;
        const newPoint = {
            x: lastPoint.x + this.p.cos(angle) * stepSize,
            y: lastPoint.y + this.p.sin(angle) * stepSize,
        };
        this.points.push(newPoint);

        // Branching mechanism
        if (this.p.random() < this.branchProbability && this.points.length < this.maxLength) {
            const branchAngle = angle + this.p.random(-this.p.PI / 4, this.p.PI / 4);
            const branchPoint = {
                x: lastPoint.x + this.p.cos(branchAngle) * stepSize,
                y: lastPoint.y + this.p.sin(branchAngle) * stepSize,
            };
            this.points.push(branchPoint);
        }
    }

    display() {
        this.p.stroke(this.color);
        this.p.strokeWeight(5); 
        this.p.noFill();
        this.p.beginShape();
        this.points.forEach(point => this.p.vertex(point.x, point.y));
        this.p.endShape();
    }
}
