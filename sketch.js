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

/*
function preload() {
    capture = loadImage("leaf.jpg");
}
*/

function setup() {
    pixelDensity(1);
    createCanvas(1000, 1000);

    var canvases = document.getElementsByTagName("canvas");
    if (canvases.length > 0) {
        canvases[0].getContext('2d', { willReadFrequently: true });
    }

    background(100);


    capture = createCapture(VIDEO);
    capture.size(w, h);
    capture.hide();
    capture.loadPixels();


    faceCapture = createCapture(VIDEO);
    faceCapture.size(w, h);
    faceCapture.hide();
    faceCapture.loadPixels();

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
    thresholdSliderRed.position(25, 2 * h + 60);
    thresholdSliderGreen = createSlider(0, 255, 110);
    thresholdSliderGreen.position(w + 45, 2 * h + 60);
    thresholdSliderBlue = createSlider(0, 255, 110);
    thresholdSliderBlue.position(2 * w + 65, 2 * h + 60);

    yCbCrImg = createImage(w, h);
    yCbCrImg.loadPixels();

    hsvSegmentedImg = createImage(w, h);
    hsvSegmentedImg.loadPixels();

    hueThresholdSlider = createSlider(0, 360, 180); // Hue threshold
    hueThresholdSlider.position(w + 45, 4 * h + 110);
    satThresholdSlider = createSlider(0, 100, 50);  // Saturation threshold
    satThresholdSlider.position(w + 45, 4 * h + 130);
    valThresholdSlider = createSlider(0, 100, 50);  // Brightness (Value) threshold
    valThresholdSlider.position(w + 45, 4 * h + 150);

    yCbCrSegmentedImg = createImage(w, h);
    yCbCrSegmentedImg.loadPixels();

    yThresholdSlider = createSlider(0, 255, 150);
    yThresholdSlider.position(2 * w + 65, 4 * h + 110)
    cbThresholdSlider = createSlider(0, 255, 150);
    cbThresholdSlider.position(2 * w + 65, 4 * h + 130);
    crThresholdSlider = createSlider(0, 255, 150);
    crThresholdSlider.position(2 * w + 65, 4 * h + 150);
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

// Function to draw faces
function drawFaces(detections) {
    push();
    translate(20, 4 * h + 170);
    console.log("Drawing faces");
    for (let i = 0; i < detections.length; i++) {
        console.log(detections[i]);
        let x = detections[i].alignedRect._box._x;
        let y = detections[i].alignedRect._box._y;
        let width = detections[i].alignedRect._box._width;
        let height = detections[i].alignedRect._box._height;
        noFill();
        stroke(255, 0, 0);
        strokeWeight(2);
        rect(x, y, width, height);
        // Extract the face area from the video
        let faceImg = faceCapture.get(x, y, width, height);
        faceImg.loadPixels();

        let faceW = Math.floor(faceImg.width);
        let faceH = Math.floor(faceImg.height);
        // Convert the face area to grayscale
        for (let j = 0; j < faceW; j++) {
            for (let k = 0; k < faceH; k++) {
                let index = (j + k * faceW) * 4;
                let r = faceImg.pixels[index];
                let g = faceImg.pixels[index + 1];
                let b = faceImg.pixels[index + 2];
                // A simple average for grayscale conversion
                let gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios
                faceImg.pixels[index] = gray;
                faceImg.pixels[index + 1] = gray;
                faceImg.pixels[index + 2] = gray;
            }
        }
        faceImg.updatePixels();

        // Draw the grayscale face area back onto the canvas
        image(faceImg, x, y);
    }
    pop();
}

function draw() {
    background(100);
    image(capture, 20, 20);
    capture.loadPixels();
    faceCapture.loadPixels();

    for (let x = 0; x < capture.width; x++) {
        for (let y = 0; y < capture.height; y++) {
            let index = (x + y * gsImg.width) * 4;

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
        }
    }
    gsImg.updatePixels();
    image(gsImg, w + 40, 20);

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

    image(capture, 20, 3 * h + 100);
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
}

function grayscaleFilterBright(index, r, g, b) {
    var gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios 

    //increasing brightness by 20% but capping pixel intensity to 255
    if (gray * 1.2 < 255)
        gray *= 1.2;    //multiplying by 1.2 to increase brightness by 20%
    else
        gray = 255;

    gsImg.pixels[index + 0] = gsImg.pixels[index + 1] = gsImg.pixels[index + 2] = gray;
    gsImg.pixels[index + 3] = 255;     //alpha set to 255
}

function separateChannels(index, r, g, b) {
    // Set red component image pixels
    rImg.pixels[index] = r;
    rImg.pixels[index + 1] = r;
    rImg.pixels[index + 2] = r;
    rImg.pixels[index + 3] = 255;     //alpha set to 255

    // Set green component image pixels
    gImg.pixels[index] = g;
    gImg.pixels[index + 1] = g;
    gImg.pixels[index + 2] = g;
    gImg.pixels[index + 3] = 255;     //alpha set to 255

    // Set blue component image pixels
    bImg.pixels[index] = b;
    bImg.pixels[index + 1] = b;
    bImg.pixels[index + 2] = b;
    bImg.pixels[index + 3] = 255;     //alpha set to 255
}

function imageSegmentation(index, r, g, b) {
    // Apply thresholding based on slider values for each color channel
    var rThreshold = thresholdSliderRed.value();
    var gThreshold = thresholdSliderGreen.value();
    var bThreshold = thresholdSliderBlue.value();

    if (r >= rThreshold) {
        rSegImg.pixels[index] = rSegImg.pixels[index + 1] = rSegImg.pixels[index + 2] = r;
    } else {
        rSegImg.pixels[index] = rSegImg.pixels[index + 1] = rSegImg.pixels[index + 2] = 0;
    }
    rSegImg.pixels[index + 3] = 255;

    if (g >= gThreshold) {
        gSegImg.pixels[index] = gSegImg.pixels[index + 1] = gSegImg.pixels[index + 2] = g;
    } else {
        gSegImg.pixels[index] = gSegImg.pixels[index + 1] = gSegImg.pixels[index + 2] = 0;
    }
    gSegImg.pixels[index + 3] = 255;

    if (b >= bThreshold) {
        bSegImg.pixels[index] = bSegImg.pixels[index + 1] = bSegImg.pixels[index + 2] = b;
    } else {
        bSegImg.pixels[index] = bSegImg.pixels[index + 1] = bSegImg.pixels[index + 2] = 0;
    }
    bSegImg.pixels[index + 3] = 255;

}


// RGB to HSV conversion
function rgbToHsv(r, g, b) {
    //Normalize rgb values
    r /= 255, g /= 255, b /= 255;
    //max and min values from the rgb
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (d == 0) {
        h = 0; // achromatic
    } else {
        let rPrime = (max - r) / d;
        let gPrime = (max - g) / d;
        let bPrime = (max - b) / d;

        if (r === max) h = (g === min ? 5 + bPrime : 1 - gPrime);
        else if (g === max) h = (b === min ? 1 + rPrime : 3 - bPrime);
        else if (b === max) h = (r === min ? 3 + gPrime : 5 - rPrime);

        //normalizing h
        h /= 6;
    }
    return [h, s, v];
}


// RGB to YCbCr conversion
/**
 * I used the formula provided on wikipedia as it was easier to implement.
 * https://en.wikipedia.org/wiki/YCbCr
 */
function rgbToYCbCr(r, g, b) {
    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    let cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    return [y, cb, cr];
}
