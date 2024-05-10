export default class DataManager {
    constructor() {
        this.devices = {};
        this.colorCount = { red: 0, green: 0, blue: 0 };
        this.colorWeights = {};
        this.disconnectTimeout = 6000;
    }

    getColorFromValue(value) {
        switch (value) {
            case 1: return 'red';
            case 2: return 'green';
            case 3: return 'blue';
            default: return 'unknown';
        }
    }

    calculateWeight(beta) {
        let cappedBeta = Math.min(Math.max(beta, -90), 90);
        let normalizedBeta = (cappedBeta + 90) / 180;
        let weight = normalizedBeta;
        console.log(`Calculated weight for beta ${beta}: ${weight}`);
        return weight;
    }

    recalculateColorCounts() {
        let newCounts = { red: 0, green: 0, blue: 0 };
        Object.values(this.colorWeights).forEach(entry => {
            newCounts[entry.color] += entry.weight;
        });

        Object.keys(this.colorCount).forEach(color => {
            this.colorCount[color] = newCounts[color] / Object.values(this.colorWeights).filter(e => e.color === color).length || 0;
        });

        console.log(`Updated color counts: Red - ${this.colorCount.red.toFixed(2)}, Green - ${this.colorCount.green.toFixed(2)}, Blue - ${this.colorCount.blue.toFixed(2)}`);
    }

    updateColorCount(deviceId, color, weight, isAdding = true) {
        if (isAdding) {
            this.colorWeights[deviceId] = { color, weight };
        } else {
            delete this.colorWeights[deviceId];
        }
        this.recalculateColorCounts();
    }

    manageDevice(message) {
        console.log("Managing device:", message);
        let deviceId = message.from;
        let newColorValue = this.getColorFromValue(message.colorValue);
        let newWeight = this.calculateWeight(message.beta);

        if (!this.devices[deviceId]) {
            console.log(`Adding new device: ${deviceId}`);
            this.devices[deviceId] = {
                ...message,
                color: newColorValue,
                weight: newWeight,
                timer: setTimeout(() => this.removeDevice(deviceId), this.disconnectTimeout),
            };
            this.updateColorCount(deviceId, newColorValue, newWeight, true);
        } else {
            clearTimeout(this.devices[deviceId].timer);
            this.devices[deviceId].timer = setTimeout(() => this.removeDevice(deviceId), this.disconnectTimeout);
            let currentColor = this.devices[deviceId].color;
            let currentWeight = this.devices[deviceId].weight;

            // Update device info
            this.devices[deviceId] = {...this.devices[deviceId], ...message, weight: newWeight};

            if (currentColor !== newColorValue) {
                this.updateColorCount(deviceId, currentColor, currentWeight, false);
                this.updateColorCount(deviceId, newColorValue, newWeight, true);
            } else if (currentWeight !== newWeight) {
                this.updateColorCount(deviceId, currentColor, currentWeight, false);
                this.updateColorCount(deviceId, newColorValue, newWeight, true);
            }
        }
    }

    removeDevice(deviceId) {
        if (this.devices[deviceId]) {
            console.log(`Removing inactive device: ${deviceId}`);
            let { color, weight } = this.devices[deviceId];
            this.updateColorCount(deviceId, color, weight, false);
            delete this.devices[deviceId];
            console.log(`Device ${deviceId} removed. Current device count: ${Object.keys(this.devices).length}`);
        }
    }
}
