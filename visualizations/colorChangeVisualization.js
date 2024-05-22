// colorChangeVisualization.js
import Visualization from '../visualization.js';

export default class ColorChangeVisualization extends Visualization {
    draw() {
         // Ændrer baggrundsfarven til den samlede farve, ved at kombinere den samlede stemmevægt.
        this.p.background(
            this.p.map(this.dataManager.colorCount.red, 0, 1, 0, 255),
            this.p.map(this.dataManager.colorCount.green, 0, 1, 0, 255),
            this.p.map(this.dataManager.colorCount.blue, 0, 1, 0, 255)
        );

        // Tekst til at visualisere antallet af tilsluttede enheder og hvilke farver de stemmer.
        this.p.noStroke();
        this.p.fill(255); // White text
        this.p.textSize(16);
        this.p.text(`Total connected devices: ${Object.keys(this.dataManager.devices).length}`, 20, 30);
        this.p.text(`Red votes: ${this.dataManager.colorCount.red.toFixed(2)}`, 20, 50);
        this.p.text(`Green votes: ${this.dataManager.colorCount.green.toFixed(2)}`, 20, 70);
        this.p.text(`Blue votes: ${this.dataManager.colorCount.blue.toFixed(2)}`, 20, 90);
        
    }
}
