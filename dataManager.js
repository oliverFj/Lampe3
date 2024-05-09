// dataManager.js

export default class DataManager {
    constructor() {
        this.devices = {};
        this.colorCount = {red: 0, green: 0, blue: 0};
        this.colorWeights = {red: [], green: [], blue: []};
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

    calculateAverageWeight(color) {
        let weights = this.colorWeights[color];
        if (weights.length === 0) return 0;
        let sum = weights.reduce((acc, val) => acc + val, 0);
        return sum / weights.length;
    }

    updateColorCount(color, weight, isAdding = true) {
        if (isAdding) {
            this.colorWeights[color].push(weight);
        } else {
            let index = this.colorWeights[color].indexOf(weight);
            if (index > -1) {
                this.colorWeights[color].splice(index, 1);
            }
        }
        let averageWeight = this.calculateAverageWeight(color);
        this.colorCount[color] = averageWeight;

        console.log(`Updated color counts: Red - ${this.colorCount.red.toFixed(2)}, Green - ${this.colorCount.green.toFixed(2)}, Blue - ${this.colorCount.blue.toFixed(2)}`);
    }

    manageDevice(message) {
        console.log("Managing device:", message);
        let deviceId = message.from;
        let newColorValue = this.getColorFromValue(message.colorValue);
        let betaValue = message.beta;
        let alphaValue = message.alpha; 
        let gammaValue = message.gamma;
        let newWeight = this.calculateWeight(betaValue);

        if (!this.devices[deviceId]) {
            console.log(`Adding new device: ${deviceId}`);
            this.devices[deviceId] = {
                color: newColorValue,
                beta: betaValue,
                alpha: alphaValue, 
                gamma: gammaValue, 
                timer: setTimeout(() => this.removeDevice(deviceId), this.disconnectTimeout)
            };
            this.updateColorCount(newColorValue, newWeight);
        } else {
            clearTimeout(this.devices[deviceId].timer);
            this.devices[deviceId].timer = setTimeout(() => this.removeDevice(deviceId), this.disconnectTimeout);

            let currentColorValue = this.devices[deviceId].color;
            let currentWeight = this.calculateWeight(this.devices[deviceId].beta);

            if (currentColorValue !== newColorValue) {
                console.log(`Device ${deviceId} changed color vote from ${currentColorValue} to ${newColorValue}`);
                this.updateColorCount(currentColorValue, currentWeight, false);
                this.updateColorCount(newColorValue, newWeight);
            } else if (this.devices[deviceId].beta !== betaValue) {
                this.updateColorCount(currentColorValue, currentWeight, false);
                this.updateColorCount(currentColorValue, newWeight);
            }

            this.devices[deviceId].color = newColorValue;
            this.devices[deviceId].beta = betaValue;
        }
    }

    removeDevice(deviceId) {
        if (this.devices[deviceId]) {
            console.log(`Removing inactive device: ${deviceId}`);
            let { color, beta } = this.devices[deviceId];
            let weight = this.calculateWeight(beta);
            this.updateColorCount(color, weight, false);
            delete this.devices[deviceId];
            console.log(`Device ${deviceId} removed. Current device count: ${Object.keys(this.devices).length}`);
        }
    }
}
