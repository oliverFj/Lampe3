// threeCircles.js
import Visualization from '../visualization.js';

export default class ThreeCircles extends Visualization {
    constructor(p, dataManager) {
        super(p, dataManager);
        // Initialize previous sizes to some starting values
        this.prevRedSize = 50;
        this.prevGreenSize = 50;
        this.prevBlueSize = 50;

        // Initialize white circle sizes
        this.whiteRedSize = 60;
        this.whiteGreenSize = 60;
        this.whiteBlueSize = 60;

        // Initialize background color to a darker color
        this.bgColor = [30, 30, 30]; // Dark gray background
    }

    setup() {
        this.p.createCanvas(800, 600);
        this.p.frameRate(60); // Ensure the frame rate is sufficient for smooth transitions
    }

    draw() {
        // Set the background color
        this.p.background(this.bgColor);

        this.p.noStroke();

        // Beregn målet for cirkles størrelse ud fra dataen
        const targetRedSize = this.p.map(this.dataManager.colorCount.red, 0, 1, 50, 250);
        const targetGreenSize = this.p.map(this.dataManager.colorCount.green, 0, 1, 50, 250);
        const targetBlueSize = this.p.map(this.dataManager.colorCount.blue, 0, 1, 50, 250);

        // Brug lerp til at animere cirkels størrelse fra forrige til målets
        const redSize = this.p.lerp(this.prevRedSize, targetRedSize, 0.1);
        const greenSize = this.p.lerp(this.prevGreenSize, targetGreenSize, 0.1);
        const blueSize = this.p.lerp(this.prevBlueSize, targetBlueSize, 0.1);

        // Opdater forrige størrelser
        this.prevRedSize = redSize;
        this.prevGreenSize = greenSize;
        this.prevBlueSize = blueSize;

        // Circle positions
        const offsetX = 250;

        // Draw colored circles
        this.p.fill(255, 0, 0);
        this.p.ellipse(this.p.width / 2 - offsetX, this.p.height / 2, redSize, redSize);
        this.p.fill(0, 255, 0);
        this.p.ellipse(this.p.width / 2, this.p.height / 2, greenSize, greenSize);
        this.p.fill(0, 0, 255);
        this.p.ellipse(this.p.width / 2 + offsetX, this.p.height / 2, blueSize, blueSize);

        // Draw white circles around the colored circles with stroke and no fill
        this.p.noFill();
        this.p.stroke(255);
        this.p.strokeWeight(5); // Adjust the stroke weight as needed
        this.p.ellipse(this.p.width / 2 - offsetX, this.p.height / 2, this.whiteRedSize, this.whiteRedSize);
        this.p.ellipse(this.p.width / 2, this.p.height / 2, this.whiteGreenSize, this.whiteGreenSize);
        this.p.ellipse(this.p.width / 2 + offsetX, this.p.height / 2, this.whiteBlueSize, this.whiteBlueSize);

        // Check if any colored circle matches the size of its white circle
        if (Math.abs(redSize - this.whiteRedSize) < 1) {
            this.changeBackgroundColor(155, 0, 0); // Darker red background
        } else if (Math.abs(greenSize - this.whiteGreenSize) < 1) {
            this.changeBackgroundColor(0, 155, 0); // Darker green background
        } else if (Math.abs(blueSize - this.whiteBlueSize) < 1) {
            this.changeBackgroundColor(0, 0, 155); // Darker blue background
        }
    }

    changeBackgroundColor(r, g, b) {
        this.bgColor = [r, g, b];
        // Generate new sizes for white circles
        this.whiteRedSize = this.p.random(60, 260);
        this.whiteGreenSize = this.p.random(60, 260);
        this.whiteBlueSize = this.p.random(60, 260);
    }
}
