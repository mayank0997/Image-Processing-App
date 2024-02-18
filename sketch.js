var capture = null;     //variable to store the capture of the video
var w = 160;    //width of image
var h = 120;    //height of image
var gsImg;
var rImg, bImg, gImg;
var rSegImg, bSegImg, gSegImg;


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

    rSegImg = createImage(capture.width, capture.height);
    gSegImg = createImage(capture.width, capture.height);
    bSegImg = createImage(capture.width, capture.height);

    rImg.loadPixels();
    gImg.loadPixels();
    bImg.loadPixels();

    thresholdSliderRed = createSlider(0, 255, 110);
    thresholdSliderRed.position(25, 2 * h + 60);
    thresholdSliderGreen = createSlider(0, 255, 110);
    thresholdSliderGreen.position((capture.width) + 45, 2 * h + 60);
    thresholdSliderBlue = createSlider(0, 255, 110);
    thresholdSliderBlue.position(2 * (capture.width) + 65, 2 * h + 60);

    rSegImg.loadPixels();
    gSegImg.loadPixels();
    bSegImg.loadPixels();
}

function draw() {
    background(100);
    image(capture, 20, 20);
    capture.loadPixels();
    for (x = 0; x < capture.width; x++) {
        for (y = 0; y < capture.height; y++) {
            var index = (x + y * gsImg.width) * 4;

            var r = capture.pixels[index + 0];
            var g = capture.pixels[index + 1];
            var b = capture.pixels[index + 2];

            grayscaleFilterBright(index, r, g, b);
            separateChannels(index, r, g, b);
            imageSegmentation(index, r, g, b);
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
    let rThreshold = thresholdSliderRed.value();
    let gThreshold = thresholdSliderGreen.value();
    let bThreshold = thresholdSliderBlue.value();

    // Segment red channel
    if (r >= rThreshold)
        rSegImg.pixels[index] = 255;
    else
        rSegImg.pixels[index] = 0;
    rSegImg.pixels[index + 1] = 0;
    rSegImg.pixels[index + 2] = 0;
    rSegImg.pixels[index + 3] = 255; // Alpha

    // Segment green channel
    gSegImg.pixels[index] = 0;
    if (g >= gThreshold)
        gSegImg.pixels[index + 1] = 255;
    else
        gSegImg.pixels[index + 1] = 0;
    gSegImg.pixels[index + 2] = 0;
    gSegImg.pixels[index + 3] = 255; // Alpha

    // Segment blue channel
    bSegImg.pixels[index] = 0;
    bSegImg.pixels[index + 1] = 0;
    if (b >= bThreshold)
        bSegImg.pixels[index + 2] = 255;
    else
        bSegImg.pixels[index + 2] = 0;
    bSegImg.pixels[index + 3] = 255; // Alpha


    /*
    var gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios
    if (r >= rThreshold) {
        var gray = r * 0.299;
        if (gray > 255)
            gray = 255;
        rSegImg[index] = rSegImg[index + 1] = rSegImg[index + 2] = gray;
        rSegImg[index + 3] = 255;
    }
    if (g >= gThreshold) {
        var gray = g * 0.587;
        if (gray > 255)
            gray = 255;
        gSegImg[index] = gSegImg[index + 1] = gSegImg[index + 2] = gray;
        gSegImg[index + 3] = 255;
    }
    if (b > bThreshold) {
        var gray = b * 0.114;
        if (gray > 255)
            gray = 255;
        bSegImg[index] = bSegImg[index + 1] = bSegImg[index + 2] = gray;
        bSegImg[index + 3] = 255;
    }
    */
}