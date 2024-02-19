var capture = null;     //variable to store the capture of the video
var w = 160;    //width of image
var h = 120;    //height of image
var gsImg;
var rImg, bImg, gImg;
var rSegImg, bSegImg, gSegImg;
var hsvImg;

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

    //grayscale image
    gsImg = createImage(capture.width, capture.height);
    gsImg.loadPixels();

    // Initialize component images to be the same size as the original
    rImg = createImage(capture.width, capture.height);
    gImg = createImage(capture.width, capture.height);
    bImg = createImage(capture.width, capture.height);

    rImg.loadPixels();
    gImg.loadPixels();
    bImg.loadPixels();

    rSegImg = createImage(capture.width, capture.height);
    gSegImg = createImage(capture.width, capture.height);
    bSegImg = createImage(capture.width, capture.height);

    rSegImg.loadPixels();
    gSegImg.loadPixels();
    bSegImg.loadPixels();

    hsvImg = createImage(capture.width, capture.height);
    hsvImg.loadPixels();

    thresholdSliderRed = createSlider(0, 255, 110);
    thresholdSliderRed.position(25, 2 * h + 60);
    thresholdSliderGreen = createSlider(0, 255, 110);
    thresholdSliderGreen.position((capture.width) + 45, 2 * h + 60);
    thresholdSliderBlue = createSlider(0, 255, 110);
    thresholdSliderBlue.position(2 * (capture.width) + 65, 2 * h + 60);
}

function draw() {
    background(100);
    image(capture, 20, 20);
    capture.loadPixels();

    colorMode(HSB, 360, 100, 100); // Set color mode to HSB
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
        }
    }
    gsImg.updatePixels();
    image(gsImg, w + 40, 20);

    // Update pixel data for component images
    rImg.updatePixels();
    gImg.updatePixels();
    bImg.updatePixels();

    hsvImg.updatePixels();

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

    image(capture, 20, 3 * h + 100);
    image(hsvImg, w + 40, 3 * h + 100);
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
function rgbToYCbCr(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 0.5;
    let cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 0.5;
    return [y, cb, cr];
}
