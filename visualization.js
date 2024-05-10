// visualization.js
export default class Visualization {
    constructor(p, dataManager) {
        this.p = p;
        this.dataManager = dataManager;
    }

    draw() {
        throw new Error("Draw method must be implemented");
    }
}
