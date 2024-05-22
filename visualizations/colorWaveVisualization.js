// colorWaveVisualization.js
import Visualization from '../visualization.js';
import Gyroscope from '../gyroscope.js';

export default class ColorWaveVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.waves = [];
    }

    draw() {
        this.p.clear();
        this.p.noStroke();
        this.processGyroscopeData();
        this.updateBackgroundColor();
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

    updateBackgroundColor() {
        const deviceData = this.dataManager.getDeviceData();
        let combinedColor = this.p.color(255, 255, 255); // Start with white
        let totalWeight = 0;

        for (let i = 0; i < deviceData.length; i++) {
            for (let j = i + 1; j < deviceData.length; j++) {
                const device1 = deviceData[i];
                const device2 = deviceData[j];

                const x1 = this.p.map(Gyroscope.normalizeData('gamma', device1.gamma), 0, 1, 0, this.p.width);
                const y1 = this.p.map(Gyroscope.normalizeData('beta', device1.beta), 0, 1, this.p.height, 0);
                const x2 = this.p.map(Gyroscope.normalizeData('gamma', device2.gamma), 0, 1, 0, this.p.width);
                const y2 = this.p.map(Gyroscope.normalizeData('beta', device2.beta), 0, 1, this.p.height, 0);

                const distance = this.p.dist(x1, y1, x2, y2);
                const maxDistance = this.p.width; // Assume the max distance is the width of the canvas
                const thresholdDistance = maxDistance / 4; // You can adjust this threshold

                if (distance < thresholdDistance) {
                    const weight = this.p.map(distance, 0, thresholdDistance, 1, 0);
                    const color1 = this.getColorForDevice(device1.color);
                    const color2 = this.getColorForDevice(device2.color);

                    combinedColor = this.p.lerpColor(combinedColor, color1, weight / 2);
                    combinedColor = this.p.lerpColor(combinedColor, color2, weight / 2);
                    totalWeight += weight;
                }
            }
        }

        if (totalWeight > 0) {
            combinedColor.setRed(combinedColor.levels[0] / totalWeight);
            combinedColor.setGreen(combinedColor.levels[1] / totalWeight);
            combinedColor.setBlue(combinedColor.levels[2] / totalWeight);
        }

        this.p.background(combinedColor);
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
