import Visualization from '../visualization.js';
import Gyroscope from '../gyroscope.js';

export default class InteractiveColorHarmony extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        this.devices = [];
    }

    draw() {
        this.p.clear();
        this.processGyroscopeData();
        this.blendColors();
        this.updatePositions();
        this.displayColors();
        this.displayText();
    }

    processGyroscopeData() {
        const deviceData = this.dataManager.getDeviceData();
        deviceData.forEach(device => {
            const betaMapped = this.p.map(Gyroscope.normalizeData('beta', device.beta), 0, 1, this.p.height, 0);
            const gammaMapped = this.p.map(Gyroscope.normalizeData('gamma', device.gamma), 0, 1, 0, this.p.width);
            const alphaMapped = this.p.map(Gyroscope.normalizeData('alpha', device.alpha), 0, 1, 50, 200);
            const deviceColor = this.getColorForDevice(device.color);

            let existingDevice = this.devices.find(d => d.id === device.id);
            if (existingDevice) {
                existingDevice.setTarget(gammaMapped, betaMapped);
                existingDevice.size = alphaMapped;
                existingDevice.color = deviceColor;
            } else {
                this.devices.push(new DeviceColor(this.p, gammaMapped, betaMapped, deviceColor, alphaMapped, device.id));
            }
        });
    }

    getColorForDevice(colorName) {
        switch (colorName) {
            case 'red':
                return this.p.color(255, 0, 0);
            case 'green':
                return this.p.color(0, 255, 0);
            case 'blue':
                return this.p.color(0, 0, 255);
            case 'yellow':
                return this.p.color(255, 255, 0);
            default:
                return this.p.color(200); // Default to gray if unknown
        }
    }

    blendColors() {
        for (let i = 0; i < this.devices.length; i++) {
            for (let j = i + 1; j < this.devices.length; j++) {
                const device1 = this.devices[i];
                const device2 = this.devices[j];
                const distance = this.p.dist(device1.x, device1.y, device2.x, device2.y);

                if (distance < 100) {
                    const blendedColor = this.p.lerpColor(device1.color, device2.color, 0.5);
                    device1.color = blendedColor;
                    device2.color = blendedColor;
                }
            }
        }
    }

    updatePositions() {
        this.devices.forEach(device => device.updatePosition());
    }

    displayColors() {
        this.devices.forEach(device => {
            this.p.fill(device.color);
            this.p.circle(device.x, device.y, device.size);
        });
    }

    displayText() {
        this.p.fill(255);
        this.p.textSize(16);
        this.p.text(`Active devices: ${this.devices.length}`, 20, 30);
    }
}

class DeviceColor {
    constructor(p, x, y, color, size, id) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.color = color;
        this.size = size;
        this.id = id;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    updatePosition() {
        this.x = this.p.lerp(this.x, this.targetX, 0.1);
        this.y = this.p.lerp(this.y, this.targetY, 0.1);
    }
}
