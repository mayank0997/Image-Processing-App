var capture = null;     //variable to store the capture of the video
var w = 160;    //width of image
var h = 120;    //height of image
var rImg, bImg, gImg;

function setup() {
    pixelDensity(1);
    createCanvas(1000, 1000);
    background(160);
    capture = createCapture(VIDEO);
    capture.size(w, h);
    capture.hide();
    // Initialize component images to be the same size as the original
    rImg = createImage(capture.width, capture.height);
    gImg = createImage(capture.width, capture.height);
    bImg = createImage(capture.width, capture.height);
}

function draw() {
    image(capture, 20, 20);
    grayscaleFilterBright();
    separateChannels();
}

function grayscaleFilterBright() {
    var imgOut = createImage(capture.width, capture.height);
    imgOut.loadPixels();
    capture.loadPixels();

    for (x = 0; x < imgOut.width; x++) {
        for (y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;

            var r = capture.pixels[index + 0];
            var g = capture.pixels[index + 1];
            var b = capture.pixels[index + 2];

            var gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios 

            //increasing brightness by 20% but capping pixel intensity to 255
            if (gray * 1.2 < 255)
                gray *= 1.2;    //multiplying by 1.2 to increase brightness by 20%
            else
                gray = 255;

            imgOut.pixels[index + 0] = imgOut.pixels[index + 1] = imgOut.pixels[index + 2] = gray;
            imgOut.pixels[index + 3] = 255;
        }
    }

    imgOut.updatePixels();
    image(imgOut, w + 40, 20);
}

function separateChannels() {
    capture.loadPixels();
    rImg.loadPixels();
    gImg.loadPixels();
    bImg.loadPixels();

    for (let y = 0; y < capture.height; y++) {
        for (let x = 0; x < capture.width; x++) {
            let index = (x + y * capture.width) * 4;
            let r = capture.pixels[index];
            let g = capture.pixels[index + 1];
            let b = capture.pixels[index + 2];
            let a = capture.pixels[index + 3]; // Alpha channel

            console.log(a);

            // Set red component image pixels
            rImg.pixels[index] = r;
            rImg.pixels[index + 1] = 0;
            rImg.pixels[index + 2] = 0;
            rImg.pixels[index + 3] = a;

            // Set green component image pixels
            gImg.pixels[index] = 0;
            gImg.pixels[index + 1] = g;
            gImg.pixels[index + 2] = 0;
            gImg.pixels[index + 3] = a;

            // Set blue component image pixels
            bImg.pixels[index] = 0;
            bImg.pixels[index + 1] = 0;
            bImg.pixels[index + 2] = b;
            bImg.pixels[index + 3] = a;
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