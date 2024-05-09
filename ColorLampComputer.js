// ColorLampComputer.js
let topic = "ColorLamp"; // Topic for MQTT messages

//Denne funktion oversætter en numerisk værdi til en farvebetegnelse (rød, grøn, blå eller ukendt). 
//Denne værdi anvendes til at identificere hvilken farve en enhed stemmer på baseret på beskeden den sender.
var devices = {}; 
var colorCount = {red: 0, green: 0, blue: 0}; 
function getColorFromValue(value) {
    switch (value) {
        case 1: return 'red';
        case 2: return 'green';
        case 3: return 'blue';
        default: return 'unknown';
    }
}

//Beregner en vægtning baseret på en beta-vinkel, som normaliseres til et tal mellem 0 og 1. 
//Denne vægt bruges til at påvirke den samlede farvevægt i systemet, hvilket gør det muligt 
//at måle en enheds "stemmestyrke" baseret på dens vinkel.

function calculateWeight(beta) {
    let cappedBeta = Math.min(Math.max(beta, -90), 90); 
    let normalizedBeta = (cappedBeta + 90) / 180; 
    let weight = normalizedBeta;
    console.log(`Calculated weight for beta ${beta}: ${weight}`);
    return weight;
}

var colorWeights = {
    red: [],
    green: [],
    blue: []
};

//Opdaterer tællingen og vægtningen for en given farve, enten ved at tilføje eller fjerne en enheds vægtning. 
//Denne funktion kaldes, når en enhed tilføjes, opdateres eller fjernes, hvilket sikrer at den samlede 
//farvetælling altid er opdateret.
function calculateAverageWeight(color) {
    let weights = colorWeights[color];
    if (weights.length === 0) return 0; 
    let sum = weights.reduce((acc, val) => acc + val, 0); 
    return sum / weights.length; 
}

//Behandler indkommende MQTT-beskeder fra enheder. Denne funktion identificerer enheden, opdaterer eller
//tilføjer dens data (farve og vægt), og genstarter en timeout for at bestemme enhedens aktivitet. 
//Hvis en enheds farve eller beta ændrer sig, opdaterer den den samlede farvetælling.
function updateColorCount(color, weight, isAdding = true) {
    if (isAdding) {
        colorWeights[color].push(weight); 
    } else {
        let index = colorWeights[color].indexOf(weight);
        if (index > -1) {
            colorWeights[color].splice(index, 1); 
        }
    }
    let averageWeight = calculateAverageWeight(color); 
    colorCount[color] = averageWeight; 
    
    console.log(`Updated color counts: Red - ${colorCount.red.toFixed(2)}, Green - ${colorCount.green.toFixed(2)}, Blue - ${colorCount.blue.toFixed(2)}`);
}

let disconnectTimeout = 6000; 


//Behandler indkommende MQTT-beskeder fra enheder. Denne funktion identificerer enheden, 
//opdaterer eller tilføjer dens data (farve og vægt), og genstarter en timeout for at bestemme enhedens aktivitet. 
//Hvis en enheds farve eller beta ændrer sig, opdaterer den den samlede farvetælling.
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
            updateColorCount(currentColorValue, currentWeight, false); 
            updateColorCount(newColorValue, newWeight); 
        } else if (devices[deviceId].beta !== betaValue) {
            updateColorCount(currentColorValue, currentWeight, false); 
            updateColorCount(currentColorValue, newWeight); 
        }
        
        
        devices[deviceId].color = newColorValue;
        devices[deviceId].beta = betaValue;
    }
}

//Fjerner en enhed fra systemet, hvis den ikke længere er aktiv (baseret på en timeout). 
//Den fjerner også enhedens indflydelse på farvetællingen, når den fjernes.
function removeDevice(deviceId) {
    if (devices[deviceId]) {
        console.log(`Removing inactive device: ${deviceId}`);
        let { color, beta } = devices[deviceId];
        let weight = calculateWeight(beta);
        updateColorCount(color, weight, false); 
        delete devices[deviceId];
        console.log(`Device ${deviceId} removed. Current device count: ${Object.keys(devices).length}`);
    }
}

//Initialiserer grafikindstillingerne for skærmen og opretter en MQTT-forbindelse med et
//specifikt emne for at modtage data fra enheder.
function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('myCanvasContainer'); 
    background(0);
    setupMQTT(topic);
}

//Denne funktion køres gentagne gange og opdaterer skærmbilledet baseret på den aktuelle 
//farvetælling og antallet af tilsluttede enheder. Den visualiserer den samlede effekt af alle
//stemmer fra enhederne som en farveændring på skærmen.
function draw() {
    let totalDevices = Object.keys(devices).length;
    let maxColorValue = Math.max(colorCount.red, colorCount.green, colorCount.blue, 1); 
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

/*

let topic = "ColorLamp"; // Topic for MQTT messages

var devices = {}; 
var colorCount = {red: 0, green: 0, blue: 0}; 
function getColorFromValue(value) {
    switch (value) {
        case 1: return 'red';
        case 2: return 'green';
        case 3: return 'blue';
        default: return 'unknown';
    }
}

function calculateWeight(beta) {
    let cappedBeta = Math.min(Math.max(beta, -90), 90); 
    let normalizedBeta = (cappedBeta + 90) / 180; 
    let weight = normalizedBeta;
    console.log(`Calculated weight for beta ${beta}: ${weight}`);
    return weight;
}

var colorWeights = {
    red: [],
    green: [],
    blue: []
};

function calculateAverageWeight(color) {
    let weights = colorWeights[color];
    if (weights.length === 0) return 0; 
    let sum = weights.reduce((acc, val) => acc + val, 0); 
    return sum / weights.length; 
}

function updateColorCount(color, weight, isAdding = true) {
    if (isAdding) {
        colorWeights[color].push(weight); 
    } else {
        let index = colorWeights[color].indexOf(weight);
        if (index > -1) {
            colorWeights[color].splice(index, 1); 
        }
    }
    let averageWeight = calculateAverageWeight(color); 
    colorCount[color] = averageWeight; 
    
    console.log(`Updated color counts: Red - ${colorCount.red.toFixed(2)}, Green - ${colorCount.green.toFixed(2)}, Blue - ${colorCount.blue.toFixed(2)}`);
}

let disconnectTimeout = 6000; 

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
            updateColorCount(currentColorValue, currentWeight, false); 
            updateColorCount(newColorValue, newWeight); 
        } else if (devices[deviceId].beta !== betaValue) {
            updateColorCount(currentColorValue, currentWeight, false); 
            updateColorCount(currentColorValue, newWeight); 
        }
        
        
        devices[deviceId].color = newColorValue;
        devices[deviceId].beta = betaValue;
    }
}

function removeDevice(deviceId) {
    if (devices[deviceId]) {
        console.log(`Removing inactive device: ${deviceId}`);
        let { color, beta } = devices[deviceId];
        let weight = calculateWeight(beta);
        updateColorCount(color, weight, false); 
        delete devices[deviceId];
        console.log(`Device ${deviceId} removed. Current device count: ${Object.keys(devices).length}`);
    }
}

function setup() {
    let canvas = createCanvas(500, 500);
    canvas.parent('myCanvasContainer'); 
    background(0);
    setupMQTT(topic);
}

function draw() {
    let totalDevices = Object.keys(devices).length;
    let maxColorValue = Math.max(colorCount.red, colorCount.green, colorCount.blue, 1); 
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

*/