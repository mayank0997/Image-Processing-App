var capture = null;     //variable to store the capture of the video
var w = 160;    //width of image
var h = 120;    //height of image
var gsImg;
var rImg, bImg, gImg;

function setup() {
    pixelDensity(1);
    createCanvas(1000, 1000);

    var canvases = document.getElementsByTagName("canvas");
    if (canvases.length > 0) {
        canvases[0].getContext('2d', { willReadFrequently: true });
    }

    background(160);
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
}

function draw() {
    image(capture, 20, 20);
    capture.loadPixels();
    grayscaleFilterBright();
    separateChannels();
}

function grayscaleFilterBright() {
    for (x = 0; x < gsImg.width; x++) {
        for (y = 0; y < gsImg.height; y++) {

            var index = (x + y * gsImg.width) * 4;

            var r = capture.pixels[index + 0];
            var g = capture.pixels[index + 1];
            var b = capture.pixels[index + 2];

            var gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios 

            //increasing brightness by 20% but capping pixel intensity to 255
            if (gray * 1.2 < 255)
                gray *= 1.2;    //multiplying by 1.2 to increase brightness by 20%
            else
                gray = 255;

            gsImg.pixels[index + 0] = gsImg.pixels[index + 1] = gsImg.pixels[index + 2] = gray;
            gsImg.pixels[index + 3] = 255;     //alpha set to 255
        }
    }

    gsImg.updatePixels();
    image(gsImg, w + 40, 20);
}

function separateChannels() {
    for (var y = 0; y < capture.height; y++) {
        for (var x = 0; x < capture.width; x++) {
            var index = (x + y * capture.width) * 4;
            var r = capture.pixels[index];
            var g = capture.pixels[index + 1];
            var b = capture.pixels[index + 2];

            // Set red component image pixels
            rImg.pixels[index] = r;
            rImg.pixels[index + 1] = 0;
            rImg.pixels[index + 2] = 0;
            rImg.pixels[index + 3] = 255;     //alpha set to 255

            // Set green component image pixels
            gImg.pixels[index] = 0;
            gImg.pixels[index + 1] = g;
            gImg.pixels[index + 2] = 0;
            gImg.pixels[index + 3] = 255;     //alpha set to 255

            // Set blue component image pixels
            bImg.pixels[index] = 0;
            bImg.pixels[index + 1] = 0;
            bImg.pixels[index + 2] = b;
            bImg.pixels[index + 3] = 255;     //alpha set to 255
        }
    }

    // Update pixel data for component images
    rImg.updatePixels();
    gImg.updatePixels();
    bImg.updatePixels();

    image(rImg, 20, h + 40); // Red component
    image(gImg, (capture.width) + 40, h + 40); // Green component
    image(bImg, 2 * (capture.width) + 60, h + 40); // Blue component
}