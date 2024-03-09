var capture = null;     //variable to store the capture of the video
const w = 160;    //width of image
const h = 120;    //height of image
var gsImg;
var rImg, bImg, gImg;
var rSegImg, bSegImg, gSegImg;
var hsvImg;
var yCbCrImg;

var thresholdSliderRed, thresholdSliderGreen, thresholdSliderBlue;

var hueThresholdSlider, satThresholdSlider, valThresholdSlider;
var hsvSegmentedImg;

var yThresholdSlider, cbThresholdSlider, crThresholdSlider;
var yCbCrSegmentedImg;

var faceCapture;
var faceapi;
var detections = [];

var rippleImage; // Image for ripple effect
var resetRippleButton;

var currentMode;

var picture = null;

// Global variables for ripple center and state
let rippleCenterX = 0;
let rippleCenterY = 0;
let ripple = false;

function setup() {

    textSize(10);
    pixelDensity(1);
    createCanvas(1000, 1000);

    var canvases = document.getElementsByTagName("canvas");
    if (canvases.length > 0) {
        canvases[0].getContext('2d', { willReadFrequently: true });
    }

    background(100);

    // capture = createCapture(VIDEO);
    // capture.size(w, h);
    // capture.hide();
    // capture.loadPixels();

    picture = createCapture(VIDEO);
    picture.size(w, h);
    picture.hide();
    picture.loadPixels();

    faceCapture = createCapture(VIDEO);
    faceCapture.size(w, h);
    faceCapture.hide();
    faceCapture.loadPixels();

    text('number key - mode', 20, 5 * h + 190);
    text('1 - Face Detection', 20, 5 * h + 210);
    text('2 - Grayscale Face', 20, 5 * h + 230);
    text('3 - Blur Face', 20, 5 * h + 250);
    text('4 - HSV Face', 20, 5 * h + 270);
    text('4 - Pixelate Face', 20, 5 * h + 290);

    // Initialize the face detection method
    const faceOptions = { withLandmarks: true, withDescriptors: false };
    faceapi = ml5.faceApi(faceCapture, faceOptions, modelReady);

    //capture.resize(w, h);
    //capture.loadPixels();

    //grayscale image
    gsImg = createImage(w, h);
    gsImg.loadPixels();

    // Initialize component images to be the same size as the original
    rImg = createImage(w, h);
    gImg = createImage(w, h);
    bImg = createImage(w, h);

    rImg.loadPixels();
    gImg.loadPixels();
    bImg.loadPixels();

    rSegImg = createImage(w, h);
    gSegImg = createImage(w, h);
    bSegImg = createImage(w, h);

    rSegImg.loadPixels();
    gSegImg.loadPixels();
    bSegImg.loadPixels();

    hsvImg = createImage(w, h);
    hsvImg.loadPixels();

    thresholdSliderRed = createSlider(0, 255, 110);
    thresholdSliderRed.position(45, 2 * h + 60);
    thresholdSliderRed.size(100);
    text('R', 25, 2 * h + 65);
    thresholdSliderGreen = createSlider(0, 255, 110);
    thresholdSliderGreen.position(w + 65, 2 * h + 60);
    thresholdSliderGreen.size(100);
    text('G', w + 45, 2 * h + 65);
    thresholdSliderBlue = createSlider(0, 255, 110);
    thresholdSliderBlue.position(2 * w + 85, 2 * h + 60);
    thresholdSliderBlue.size(100);
    text('B', 2 * w + 65, 2 * h + 65);

    yCbCrImg = createImage(w, h);
    yCbCrImg.loadPixels();

    hsvSegmentedImg = createImage(w, h);
    hsvSegmentedImg.loadPixels();

    hueThresholdSlider = createSlider(0, 360, 180); // Hue threshold
    hueThresholdSlider.position(w + 70, 4 * h + 110);
    hueThresholdSlider.size(100);
    text('H', w + 50, 4 * h + 115);
    satThresholdSlider = createSlider(0, 100, 50);  // Saturation threshold
    satThresholdSlider.position(w + 70, 4 * h + 130);
    satThresholdSlider.size(100);
    text('S', w + 50, 4 * h + 135);
    valThresholdSlider = createSlider(0, 100, 50);  // Brightness (Value) threshold
    valThresholdSlider.position(w + 70, 4 * h + 150);
    valThresholdSlider.size(100);
    text('V', w + 50, 4 * h + 155);


    yCbCrSegmentedImg = createImage(w, h);
    yCbCrSegmentedImg.loadPixels();

    yThresholdSlider = createSlider(0, 255, 150);
    yThresholdSlider.position(2 * w + 90, 4 * h + 110)
    yThresholdSlider.size(100);
    text('Y', 2 * w + 65, 4 * h + 115);
    cbThresholdSlider = createSlider(0, 255, 150);
    cbThresholdSlider.position(2 * w + 90, 4 * h + 130);
    cbThresholdSlider.size(100);
    text('Cb', 2 * w + 65, 4 * h + 135);
    crThresholdSlider = createSlider(0, 255, 150);
    crThresholdSlider.position(2 * w + 90, 4 * h + 150);
    crThresholdSlider.size(100);
    text('Cr', 2 * w + 65, 4 * h + 155);

    rippleImage = createImage(w, h);
    rippleImage.loadPixels();

    // Create a button to reset the ripple effect
    resetRippleButton = createButton('Reset Ripple');
    resetRippleButton.position(2 * w + 60, 5 * h + 200);
    resetRippleButton.mousePressed(resetRipple);

    // Button for capturing webcam image
    captureButton = createButton('Capture Webcam Image');
    captureButton.mousePressed(() => {
        let name = prompt('Enter a name for the image:', 'captured_image');
        let pic = createImage(w, h);
        pic = picture.get();

        if (name) {
            save(pic, `${name}.png`);
        }
    });
    captureButton.position(3 * w + 80, 40);

    // File input for uploading images
    fileInput = createFileInput(file => {
        if (file.type === 'image') {
            // Use loadImage() to read the uploaded file
            loadImage(file.data, img => {
                capture = img;
                capture.resize(w, h);
            });
        }
    });
    fileInput.position(3 * w + 80, 60);
    currentMode = 'NORMAL';
}

// Callback function when the model is loaded
function modelReady() {
    console.log('Face API Model Ready!');
    faceapi.detect(gotResults);
}

// Callback function to get results
function gotResults(err, result) {
    if (err) {
        console.log(err);
        return;
    }
    detections = result;
    faceapi.detect(gotResults); // Call function to continuously detect faces
}

function mousePressed() {
    // Check if the mouse click is within the bounds of the rippleImage
    if (mouseX > w + 40 && mouseX < w + 40 + w && mouseY > 5 * h + 190 && mouseY < 5 * h + 190 + h) {
        rippleCenterX = mouseX - (w + 40);
        rippleCenterY = mouseY - (5 * h + 190);
        ripple = true; // Set the flag to true to update the ripple effect
    }
}

function draw() {

    if (capture == null)
        capture = picture;

    image(capture, 20, 20);
    capture.loadPixels();
    picture.loadPixels();
    faceCapture.loadPixels();

    for (let x = 0; x < capture.width; x++) {
        for (let y = 0; y < capture.height; y++) {
            let index = (x + y * capture.width) * 4;

            let r = capture.pixels[index + 0];
            let g = capture.pixels[index + 1];
            let b = capture.pixels[index + 2];

            grayscaleFilterBright(index, r, g, b);
            separateChannels(index, r, g, b);
            imageSegmentation(index, r, g, b);

            // Apply RGB to HSV conversion
            let [h, s, v] = rgbToHsv(r, g, b);

            /**
             * For visualization, map H to red, S to green, V to blue. 
             * An HSV heatmap is generated.
             */

            hsvImg.pixels[index] = h * 255; // Hue mapped to red channel
            hsvImg.pixels[index + 1] = s * 255; // Saturation mapped to green
            hsvImg.pixels[index + 2] = v * 255; // Value mapped to blue
            hsvImg.pixels[index + 3] = 255; // Alpha

            let gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios
            if (h * 360 <= hueThresholdSlider.value() && s * 100 <= satThresholdSlider.value() && v * 100 <= valThresholdSlider.value()) {
                // If within threshold, paint the pixel with gray
                hsvSegmentedImg.pixels[index] = gray;
                hsvSegmentedImg.pixels[index + 1] = gray;
                hsvSegmentedImg.pixels[index + 2] = gray;
            } else {
                // Else, make it black
                hsvSegmentedImg.pixels[index] = 0;
                hsvSegmentedImg.pixels[index + 1] = 0;
                hsvSegmentedImg.pixels[index + 2] = 0;
            }
            hsvSegmentedImg.pixels[index + 3] = 255; // Alpha            

            // Convert RGB to YCbCr
            let [yValue, cb, cr] = rgbToYCbCr(r, g, b);

            // Map YCbCr values to RGB channels for visualization
            yCbCrImg.pixels[index] = yValue; // Y mapped to red channel
            yCbCrImg.pixels[index + 1] = cb; // Cb mapped to green channel
            yCbCrImg.pixels[index + 2] = cr; // Cr mapped to blue channel
            yCbCrImg.pixels[index + 3] = 255; // Alpha

            //console.log(yValue + " : " + yThresholdSlider.value());
            if (yValue <= yThresholdSlider.value() && cb <= cbThresholdSlider.value() && cr <= crThresholdSlider.value()) {
                // If within threshold, paint the pixel with gray
                yCbCrSegmentedImg.pixels[index] = gray;
                yCbCrSegmentedImg.pixels[index + 1] = gray;
                yCbCrSegmentedImg.pixels[index + 2] = gray;
            } else {
                // Else, make it black
                yCbCrSegmentedImg.pixels[index] = 0;
                yCbCrSegmentedImg.pixels[index + 1] = 0;
                yCbCrSegmentedImg.pixels[index + 2] = 0;
            }
            yCbCrSegmentedImg.pixels[index + 3] = 255; // Alpha

            if (ripple) {
                let distance = dist(x, y, rippleCenterX, rippleCenterY);
                // Superposition of waves
                let offset = sin(distance * 0.1 - millis() * 0.005) * 15;
                offset += sin(distance * 0.15 - millis() * 0.007) * 7.5;
                offset += sin(distance * 0.05 - millis() * 0.003) * 2.5;
                // Ensure offset does not exceed image bounds
                offset = constrain(offset, -25, 25);

                let newX = constrain(x + offset, 0, capture.width - 1);
                let newY = constrain(y + offset, 0, capture.height - 1);
                let newIndex = (floor(newX) + floor(newY) * capture.width) * 4;

                rippleImage.pixels[index] = capture.pixels[newIndex];
                rippleImage.pixels[index + 1] = capture.pixels[newIndex + 1];
                rippleImage.pixels[index + 2] = capture.pixels[newIndex + 2];
                rippleImage.pixels[index + 3] = 255;
            }
            else {
                rippleImage.pixels[index] = capture.pixels[index];
                rippleImage.pixels[index + 1] = capture.pixels[index + 1];
                rippleImage.pixels[index + 2] = capture.pixels[index + 2];
                rippleImage.pixels[index + 3] = capture.pixels[index + 3]; // Alpha remains constant  
            }
        }
    }
    gsImg.updatePixels();
    image(gsImg, w + 40, 20);

    image(picture, 2 * w + 60, 20);

    // Update pixel data for component images
    rImg.updatePixels();
    gImg.updatePixels();
    bImg.updatePixels();

    image(rImg, 20, h + 40); // Red component
    image(gImg, (capture.width) + 40, h + 40); // Green component
    image(bImg, 2 * (capture.width) + 60, h + 40); // Blue component

    text(thresholdSliderRed.value(), thresholdSliderRed.position().x + 125, thresholdSliderRed.position().y + 5);
    text(thresholdSliderGreen.value(), thresholdSliderGreen.position().x + 125, thresholdSliderGreen.position().y + 5);
    text(thresholdSliderBlue.value(), thresholdSliderBlue.position().x + 125, thresholdSliderBlue.position().y + 5);

    rSegImg.updatePixels();
    gSegImg.updatePixels();
    bSegImg.updatePixels();
    // Display segmented images below the original color components
    image(rSegImg, 20, 2 * h + 80);
    image(gSegImg, w + 40, 2 * h + 80);
    image(bSegImg, 2 * w + 60, 2 * h + 80);

    hsvImg.updatePixels();
    yCbCrImg.updatePixels();

    image(picture, 20, 3 * h + 100);
    image(hsvImg, w + 40, 3 * h + 100);
    image(yCbCrImg, 2 * w + 60, 3 * h + 100);

    hsvSegmentedImg.updatePixels();
    image(hsvSegmentedImg, w + 40, 4 * h + 170);

    yCbCrSegmentedImg.updatePixels();
    image(yCbCrSegmentedImg, 2 * w + 60, 4 * h + 170);

    faceCapture.updatePixels();
    image(faceCapture, 20, 4 * h + 170);

    // Draw detections on the face capture image
    if (detections) {
        drawFaces(detections);
    }

    rippleImage.updatePixels();
    image(rippleImage, w + 40, 5 * h + 190);
}

function keyPressed() {
    if (key === '1') {
        currentMode = 'NORMAL';
    } else if (key === '2') {
        currentMode = 'GRAYSCALE';
    } else if (key === '3') {
        currentMode = 'BLUR';
    } else if (key === '4') {
        currentMode = 'COLOR_CONVERSION';
    } else if (key === '5') {
        currentMode = 'PIXELATE';
    }
}

