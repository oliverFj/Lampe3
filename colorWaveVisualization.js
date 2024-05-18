//colorWaveVisualization.js
import Visualization from './visualization.js';
import Gyroscope from './gyroscope.js';

export default class ColorWaveVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.waves = [];
        this.lastColor = {};
    }

    draw() {
        this.p.clear();
        this.processGyroscopeData();
        this.updateWaves();
        this.displayWaves();
        this.displayText();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const betaMapped = this.p.map(Gyroscope.normalizeData('beta', device.beta), 0, 1, this.p.height, 0);
            const gammaMapped = this.p.map(Gyroscope.normalizeData('gamma', device.gamma), 0, 1, 0, this.p.width);
            const alphaMapped = this.p.map(Gyroscope.normalizeData('alpha', device.alpha), 0, 1, 10, 100);
            const deviceColor = this.getColorForDevice(device.color);
    
            this.waves.push(new Wave(this.p, gammaMapped, betaMapped, deviceColor, alphaMapped));
        });
    }

    getColorForDevice(colorName) {
        switch(colorName) {
            case 'red':
                return this.p.color(255, 0, 0);
            case 'green':
                return this.p.color(0, 255, 0);
            case 'blue':
                return this.p.color(0, 0, 255);
            default:
                return this.p.color(200); // Default to gray if unknown
        }
    }

    updateWaves() {
        this.waves.forEach(wave => wave.update());
        this.waves = this.waves.filter(wave => wave.isActive());
    }

    displayWaves() {
        this.waves.forEach(wave => {
            this.p.fill(wave.color);
            this.p.circle(wave.x, wave.y, wave.size);
            wave.color.setAlpha(255 - this.p.map(wave.size, 0, this.p.width / 2, 0, 255) * 2); // Faster fading effect
        });
    }

    displayText() {
        this.p.fill(255);
        this.p.textSize(16);
        this.p.text(`Active waves: ${this.waves.length}`, 20, 30);
    }
}

class Wave {
    constructor(p, x, y, color, size) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.growthRate = this.p.random(1, 5);
    }

    isActive() {
        return this.size < this.p.width / 2;
    }

    update() {
        this.size += this.growthRate;
    }

    updateColor(newColor) {
        this.color = newColor;
    }
}
