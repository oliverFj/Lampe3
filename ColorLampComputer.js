let topic = "ColorLamp"; // Topic for MQTT messages

var devices = {};  // Dictionary to store device data
var colorCount = {red: 0, green: 0, blue: 0}; // Dictionary to store the count of each color

function getColorFromValue(value) {
    switch (value) {
        case 1: return 'red';
        case 2: return 'green';
        case 3: return 'blue';
        default: return 'unknown'; // Handle unexpected values
    }
}

function calculateWeight(beta) {
    let cappedBeta = Math.min(Math.max(beta, -90), 90); // Cap beta angle between -90 and 90 degrees
    let normalizedBeta = (cappedBeta + 90) / 180; // Normalize beta to range from 0 to 1
    let weight = normalizedBeta; // Weight increases as the device points down
    console.log(`Calculated weight for beta ${beta}: ${weight}`);
    return weight;
}


var colorWeights = {
    red: [],
    green: [],
    blue: []
};

function updateColorWeights(color, weight) {
    colorWeights[color].push(weight); // Store the weight for the corresponding color
}

function calculateAverageWeight(color) {
    let weights = colorWeights[color];
    if (weights.length === 0) return 0; // Return 0 if there are no weights yet
    let sum = weights.reduce((acc, val) => acc + val, 0); // Calculate the sum of weights
    return sum / weights.length; // Calculate the average weight
}

function updateColorCount(color, weight, isAdding = true) {
    if (isAdding) {
        colorWeights[color].push(weight); // Simply add the new weight when a new device is registered or changes color.
    } else {
        let index = colorWeights[color].indexOf(weight);
        if (index > -1) {
            colorWeights[color].splice(index, 1); // Remove the specific weight to negate its influence.
        }
    }
    let averageWeight = calculateAverageWeight(color); // Recalculate the average
    colorCount[color] = averageWeight; // Update the color count with the new average
    
    console.log(`Updated color counts: Red - ${colorCount.red.toFixed(2)}, Green - ${colorCount.green.toFixed(2)}, Blue - ${colorCount.blue.toFixed(2)}`);
}

let disconnectTimeout = 6000; // Timeout of 6 seconds

function onMessage(message) {
    console.log("Received message:", message);
    let deviceId = message.from;
    let newColorValue = getColorFromValue(message.colorValue);
    let betaValue = message.beta;
    let newWeight = calculateWeight(betaValue);

    if (!devices[deviceId]) {
        console.log(`Adding new device: ${deviceId}`);
        devices[deviceId] = {
            color: newColorValue,
            beta: betaValue,
            timer: setTimeout(() => removeDevice(deviceId), disconnectTimeout)
        };
        updateColorCount(newColorValue, newWeight);
    } else {
        clearTimeout(devices[deviceId].timer);
        devices[deviceId].timer = setTimeout(() => removeDevice(deviceId), disconnectTimeout);
        
        let currentColorValue = devices[deviceId].color;
        let currentWeight = calculateWeight(devices[deviceId].beta);

        if (currentColorValue !== newColorValue) {
            console.log(`Device ${deviceId} changed color vote from ${currentColorValue} to ${newColorValue}`);
            updateColorCount(currentColorValue, currentWeight, false); // Remove the influence of the old color and weight
            updateColorCount(newColorValue, newWeight); // Add the new color and weight
        } else if (devices[deviceId].beta !== betaValue) {
            updateColorCount(currentColorValue, currentWeight, false); // remove old weight
            updateColorCount(currentColorValue, newWeight); // add new weight
        }
        
        // Update the stored device info
        devices[deviceId].color = newColorValue;
        devices[deviceId].beta = betaValue;
    }
}

function removeDevice(deviceId) {
    if (devices[deviceId]) {
        console.log(`Removing inactive device: ${deviceId}`);
        let { color, beta } = devices[deviceId];
        let weight = calculateWeight(beta);
        updateColorCount(color, weight, false); // Subtract the weight when removing device
        delete devices[deviceId];
        console.log(`Device ${deviceId} removed. Current device count: ${Object.keys(devices).length}`);
    }
}

function setup() {
    createCanvas(500, 500);
    background(0);
    setupMQTT(topic);
}

function draw() {
    let totalDevices = Object.keys(devices).length;
    let maxColorValue = Math.max(colorCount.red, colorCount.green, colorCount.blue, 1); // Avoid division by zero
    let redNormalized = (colorCount.red / maxColorValue) * 255;
    let greenNormalized = (colorCount.green / maxColorValue) * 255;
    let blueNormalized = (colorCount.blue / maxColorValue) * 255;
    background(redNormalized, greenNormalized, blueNormalized);
    
    fill(255);
    textSize(16);
    text(`Total connected devices: ${totalDevices}`, 20, 30);
    text(`Red votes: ${colorCount.red.toFixed(2)}`, 20, 50);
    text(`Green votes: ${colorCount.green.toFixed(2)}`, 20, 70);
    text(`Blue votes: ${colorCount.blue.toFixed(2)}`, 20, 90);

    let yOffset = 110;
    Object.keys(devices).forEach((id) => {
        let device = devices[id];
        if (device && device.beta !== undefined) {
            let deviceInfo = `Device ${id}: Color ${device.color}, Beta ${device.beta.toFixed(2)}`;
            text(deviceInfo, 20, yOffset);
            yOffset += 20;
        } else {
            console.log(`Error: Device ${id} data is incomplete or has been removed.`);
        }
    });
}


function touchStarted() {
    console.log("Touch interaction detected.");
}
