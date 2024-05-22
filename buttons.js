//buttons.js
export default class ButtonManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.createButtons();
    }

    createButtons() {
        const buttonContainer = document.getElementById('buttonContainer');

        // Previous Visualization Button
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous Visualization';
        prevButton.className = 'bg-white shadow-lg hover:bg-gray-100 text-black font-bold py-2 px-4 rounded';
        prevButton.addEventListener('click', () => {
            this.uiManager.prevVisualization();
            console.log('Switched to previous visualization.');
        });
        buttonContainer.appendChild(prevButton);

        // Next Visualization Button
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next Visualization';
        nextButton.className = 'bg-white shadow-lg hover:bg-gray-100 text-black font-bold py-2 px-4 rounded ml-2';
        nextButton.addEventListener('click', () => {
            this.uiManager.nextVisualization();
            console.log('Switched to next visualization.');
        });
        buttonContainer.appendChild(nextButton);
    }
}
