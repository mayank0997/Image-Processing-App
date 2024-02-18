var w = 160;    //width of image
var h = 120;    //height of image

function setup() {
    pixelDensity(1);
    createCanvas(1000, 1000);
    background(153);
    capture = createCapture(VIDEO);
    capture.size(w, h);
    capture.hide();
}

function draw() {
    push();
    translate(400, 0);
    scale(-1, 1);
    image(capture, w + 20, 20);
    image(grayscaleFilterBright(capture), 0, 20);
    pop();
}

function grayscaleFilterBright(img) {
    var imgOut = createImage(img.width, img.height);
    imgOut.loadPixels();
    img.loadPixels();

    for (x = 0; x < imgOut.width; x++) {
        for (y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;

            var r = img.pixels[index + 0];
            var g = img.pixels[index + 1];
            var b = img.pixels[index + 2];

            var gray = r * 0.299 + g * 0.587 + b * 0.114; // LUMA ratios 

            //increasing brightness by 20% but capping pixel intensity to 255
            if (gray * 1.2 < 255)
                gray *= 1.2;    //multiplying by 1.2 to increase brightness by 20%
            else
                gray = 255;

            //multiplying by 1.2 to increase brightness by 20%
            imgOut.pixels[index + 0] = imgOut.pixels[index + 1] = imgOut.pixels[index + 2] = gray;
            imgOut.pixels[index + 3] = 255;
        }
    }

    imgOut.updatePixels();
    return imgOut;
}
