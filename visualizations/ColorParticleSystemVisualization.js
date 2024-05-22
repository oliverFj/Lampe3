import Visualization from '../visualization.js';
import Gyroscope from '../gyroscope.js';

export default class ColorParticleSystemVisualization extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.particles = [];
    }

    draw() {
        this.p.clear();
        this.processGyroscopeData();
        this.updateParticles();
        this.displayParticles();
        this.displayText();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const alphaMapped = this.p.map(Gyroscope.normalizeData('alpha', device.alpha), 0, 1, 1, 5);
            const betaMapped = this.p.map(Gyroscope.normalizeData('beta', device.beta), 0, 1, 5, 20);
            const gammaMapped = this.p.map(Gyroscope.normalizeData('gamma', device.gamma), 0, 1, -2, 2);
            const deviceColor = this.getColorForDevice(device.color);

            this.particles.push(new Particle(this.p, this.p.random(this.p.width), this.p.random(this.p.height), betaMapped, alphaMapped, gammaMapped, deviceColor));
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

    updateParticles() {
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.isActive());
    }

    displayParticles() {
        this.particles.forEach(particle => {
            this.p.fill(particle.color);
            this.p.noStroke();
            this.p.circle(particle.x, particle.y, particle.size);
        });
    }

    displayText() {
        this.p.fill(255);
        this.p.textSize(16);
        this.p.text(`Active particles: ${this.particles.length}`, 20, 30);
    }
}

class Particle {
    constructor(p, x, y, size, speed, direction, color) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.direction = direction;
        this.color = color;
    }

    isActive() {
        return this.size > 0;
    }

    update() {
        this.x += this.direction * this.speed;
        this.y += this.direction * this.speed;
        this.size -= 0.05;
        if (this.size < 0) {
            this.size = 0;
        }
    }
}
