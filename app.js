// app.js
import UIManager from './uiManager.js';
import MQTTHandler from './mqttHandler.js';
import DataManager from './dataManager.js';
import ButtonManager from './buttons.js';

const dataManager = new DataManager();
let uiManager;
const mqttHandler = new MQTTHandler(dataManager, "ColorLamp");

// Create a new p5 instance, passing a function that defines the p5 sketch
new p5((p) => {
    p.setup = function () {
        console.log("Setup started.");
        p.createCanvas(800, 500).parent('myCanvasContainer'); // Attach the canvas directly here
        uiManager = new UIManager(dataManager, p); // Pass the p5 instance to UIManager
        uiManager.setupCanvas(); // Set up other properties

        // Initialize the ButtonManager with the UIManager instance
        new ButtonManager(uiManager);
    };

    p.draw = function () {
        uiManager.draw();
    };
/*
    p.touchStarted = function () {
        uiManager.toggleVisualization();
        console.log("Visualization mode toggled.");
    };

*/
});


