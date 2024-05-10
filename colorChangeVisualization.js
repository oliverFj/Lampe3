// colorChangeVisualization.js
import Visualization from './visualization.js';

export default class ColorChangeVisualization extends Visualization {
    draw() {
         // Change the background color based on sensor data
        this.p.background(
            this.p.map(this.dataManager.colorCount.red, 0, 1, 0, 255),
            this.p.map(this.dataManager.colorCount.green, 0, 1, 0, 255),
            this.p.map(this.dataManager.colorCount.blue, 0, 1, 0, 255)
        );

        // Example of additional drawing: displaying text for sensor data
        this.p.fill(255); // White text
        this.p.textSize(16);
        this.p.text(`Total connected devices: ${Object.keys(this.dataManager.devices).length}`, 20, 30);
        this.p.text(`Red votes: ${this.dataManager.colorCount.red.toFixed(2)}`, 20, 50);
        this.p.text(`Green votes: ${this.dataManager.colorCount.green.toFixed(2)}`, 20, 70);
        this.p.text(`Blue votes: ${this.dataManager.colorCount.blue.toFixed(2)}`, 20, 90);
        
        // You can add more visual elements as needed
    }
}
