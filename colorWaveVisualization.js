import Visualization from './visualization.js';

export default class ColorWaveVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.waves = [];
    }

    draw() {
        this.p.clear();
        this.updateWaves();
        this.displayWaves();
        this.displayText();
    }

    updateWaves() {
        // Assume device data is updated frequently via external functions
        this.processGyroscopeData();

        this.waves.forEach(wave => wave.update());
        this.waves = this.waves.filter(wave => wave.isActive());
    }

    processGyroscopeData() {
        // Example of creating a wave based on gyroscope data
        if (this.dataManager.devices) {
            Object.values(this.dataManager.devices).forEach(device => {
                let betaMapped = this.p.map(device.beta, -90, 90, 0, this.p.width);  // Map beta to x position
                let gammaMapped = this.p.map(device.gamma, -90, 90, 0, this.p.height); // Map gamma to y position
                let alphaMapped = this.p.map(device.alpha, 0, 360, 10, 100); // Use alpha for size
                let deviceColor = this.getColorForDevice(device.color); // Get color for device

                this.waves.push(new Wave(this.p, betaMapped, gammaMapped, deviceColor, alphaMapped));
            });
        }
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
                return this.p.color(255, 255, 255); // Default to white if unknown
        }
    }

    displayWaves() {
        this.waves.forEach(wave => {
            this.p.fill(wave.color);
            this.p.circle(wave.x, wave.y, wave.size);
            wave.color.setAlpha(255 - this.p.map(wave.size, 0, this.p.width / 2, 0, 255));  // Fading effect
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
        this.size = size;  // Initial size influenced by alpha
        this.color = color;
        this.growthRate = this.p.random(1, 5);  // Dynamic growth rate
    }

    isActive() {
        return this.size < this.p.width / 2;  // Active until it reaches half the width of the canvas
    }

    update() {
        this.size += this.growthRate;  // Increment size for growth
    }
}
