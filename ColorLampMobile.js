// ColorLampMobile.js 
// Sends a message to the desktop about color value based on device orientation.

let topic = "ColorLamp"; // Variable declaration for MQTT message topic


function setup() {
  createCanvas(windowWidth, windowHeight); // Creates a canvas and sets the background color to white
  noStroke(); // Removes the edges around shapes for a cleaner presentation
  background(255);
  setupMQTT(topic);
  setupOrientation(1); // Setup orientation with a threshold of 1
}

let redPressed = false; // State control for red circle
let bluePressed = false; // State control for blue circle
let greenPressed = false; // State control for green circle
let myColor = 0; // Variable to store the selected color

function draw() {
  background(255);
  let centerX = windowWidth / 2;
  let centerY = windowHeight / 2;
  let radius = min(windowWidth, windowHeight) / 2 - 20;

  // Draw circles with drop shadow effect
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = 5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(200, 200, 200, 0.50)';

  // Red circle
  fill(redPressed ? 'darkred' : 'red');
  ellipse(centerX, centerY - centerY / 2, radius);

  // Blue circle
  fill(bluePressed ? 'darkblue' : 'blue');
  ellipse(centerX, centerY + centerY / 2, radius);

  // Green circle
  fill(greenPressed ? 'darkgreen' : 'green');
  ellipse(centerX, centerY, radius);
}

function cirkelknaptrykket() {
  let upperCircleCenterY = windowHeight / 4;
  let centerCircleCenterY = windowHeight / 2;
  let lowerCircleCenterY = 3 * windowHeight / 4;
  let radius = min(windowWidth, windowHeight) / 2 - 20;

  // Detect circle button presses based on touch location
  let distToUpperCircle = dist(mouseX, mouseY, windowWidth / 2, upperCircleCenterY);
  let distToCenterCircle = dist(mouseX, mouseY, windowWidth / 2, centerCircleCenterY);
  let distToLowerCircle = dist(mouseX, mouseY, windowWidth / 2, lowerCircleCenterY);

  if (distToUpperCircle < radius / 2) {
    redPressed = true;
    bluePressed = false;
    greenPressed = false;
    myColor = 1;
    console.log("Upper circle (red) pressed");
  } else if (distToCenterCircle < radius / 2) {
    greenPressed = true;
    redPressed = false;
    bluePressed = false;
    myColor = 2;
    console.log("Center circle (green) pressed");
  } else if (distToLowerCircle < radius / 2) {
    bluePressed = true;
    redPressed = false;
    greenPressed = false;
    myColor = 3;
    console.log("Lower circle (blue) pressed");
  }
}

let updateInterval = null; // This will hold the reference to the interval

function sendCurrentStatus() {
  let currentOrientation = orientationSensor.get();
  console.log("Sending status update. Orientation:", currentOrientation);
  if (currentOrientation.alpha !== undefined) {
    let message = {
      "from": config.myID,
      "mobilemessage": "Orientation update",
      "colorValue": myColor,
      "alpha": currentOrientation.alpha,
      "beta": currentOrientation.beta,
      "gamma": currentOrientation.gamma
    };
    console.log("Sending Orientation and Color:", message);
    sendMessage(message);
  } else {
    console.log("Orientation not updated yet.");
  }
}

function touchStarted() {
  console.log("Touch detected");
  cirkelknaptrykket(); // Initiates interaction based on touch
  // If needed, you could set up the interval here if it's not already running
  if (!updateInterval) {
    updateInterval = setInterval(sendCurrentStatus, 200);  // Send update every second
  }
}