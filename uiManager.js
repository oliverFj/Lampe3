// uiManager.js
export default class UIManager {
    constructor(dataManager, p) {
        this.dataManager = dataManager;
        this.p = p; // Store the p5 instance
        this.visualizationMode = 0; // Default to color change visualization
    }

    setupCanvas() {
        this.p.background(0);
    }

    draw() {
        if (this.visualizationMode === 0) {
            this.drawColorChange();
        } else if (this.visualizationMode === 1) {
            this.drawCircleVisualization();
        }
    }

    drawColorChange() {
        // Make sure to call p5 functions on the p instance
        this.p.background(this.p.map(this.dataManager.colorCount.red, 0, 1, 0, 255),
                          this.p.map(this.dataManager.colorCount.green, 0, 1, 0, 255),
                          this.p.map(this.dataManager.colorCount.blue, 0, 1, 0, 255));
        this.p.fill(255);
        this.p.textSize(16);
        this.p.text(`Total connected devices: ${Object.keys(this.dataManager.devices).length}`, 20, 30);
        this.p.text(`Red votes: ${this.dataManager.colorCount.red.toFixed(2)}`, 20, 50);
        this.p.text(`Green votes: ${this.dataManager.colorCount.green.toFixed(2)}`, 20, 70);
        this.p.text(`Blue votes: ${this.dataManager.colorCount.blue.toFixed(2)}`, 20, 90);
    }

    drawCircleVisualization() {
        this.p.background(0);
        this.p.fill(255);
        this.p.noStroke();

        let totalBeta = 0;
        let deviceCount = 0;
        Object.values(this.dataManager.devices).forEach(device => {
            if (device.beta !== undefined) {
                totalBeta += this.dataManager.calculateWeight(device.beta);
                deviceCount++;
            }
        });

        let averageBeta = deviceCount > 0 ? totalBeta / deviceCount : 0;
        let circleSize = this.p.map(averageBeta, 0, 1, 50, 450);
        this.p.ellipse(this.p.width / 2, this.p.height / 2, circleSize, circleSize);
    }

    toggleVisualization() {
        this.visualizationMode = (this.visualizationMode + 1) % 2;
    }
}
