function drawFaceRect(x, y, width, height) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(x, y, width, height);
}

function applyGrayscaletoFace(faceImg, faceW, faceH) {
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
}

function applyGaussianBlur(faceImg, faceW, faceH) {
    let kernel = [
        [1 / 256, 4 / 256, 6 / 256, 4 / 256, 1 / 256],
        [4 / 256, 16 / 256, 24 / 256, 16 / 256, 4 / 256],
        [6 / 256, 24 / 256, 36 / 256, 24 / 256, 6 / 256],
        [4 / 256, 16 / 256, 24 / 256, 16 / 256, 4 / 256],
        [1 / 256, 4 / 256, 6 / 256, 4 / 256, 1 / 256]
    ];

    let imgCopy = faceImg.get(); // Create a copy of the image to hold the original pixels
    imgCopy.loadPixels();
    faceImg.loadPixels();

    for (let x = 0; x < faceW; x++) {
        for (let y = 0; y < faceH; y++) {
            let sumR = 0, sumG = 0, sumB = 0;
            // Apply the kernel to each pixel and its neighbors
            for (let ky = -2; ky <= 2; ky++) {
                for (let kx = -2; kx <= 2; kx++) {
                    let posX = x + kx;
                    let posY = y + ky;
                    // Ensure we don't read beyond the image borders
                    if (posX >= 0 && posX < faceW && posY >= 0 && posY < faceH) {
                        let idx = ((posY * faceW) + posX) * 4;
                        // Adjusted index for a 5x5 kernel
                        let weight = kernel[ky + 2][kx + 2]; // Notice the change from +1 to +2
                        sumR += imgCopy.pixels[idx] * weight;
                        sumG += imgCopy.pixels[idx + 1] * weight;
                        sumB += imgCopy.pixels[idx + 2] * weight;
                    }
                }
            }
            let index = (y * faceW + x) * 4;
            faceImg.pixels[index] = sumR;
            faceImg.pixels[index + 1] = sumG;
            faceImg.pixels[index + 2] = sumB;
        }
    }

}

function applyHSVtoFace(faceImg, faceW, faceH) {
    for (let j = 0; j < faceW; j++) {
        for (let k = 0; k < faceH; k++) {
            let index = (j + k * faceW) * 4;
            let r = faceImg.pixels[index];
            let g = faceImg.pixels[index + 1];
            let b = faceImg.pixels[index + 2];

            // Apply RGB to HSV conversion
            let [h, s, v] = rgbToHsv(r, g, b);

            faceImg.pixels[index] = h * 255; // Hue mapped to red channel
            faceImg.pixels[index + 1] = s * 255; // Saturation mapped to green
            faceImg.pixels[index + 2] = v * 255; // Value mapped to blue
            faceImg.pixels[index + 3] = 255; // Alpha
        }
    }
}

function applyPixelation(faceImg, faceW, faceH, blockSize = 5) {
    // blockSize defines the size of each block
    faceImg.loadPixels();
    for (let x = 0; x < faceW; x += blockSize) {
        for (let y = 0; y < faceH; y += blockSize) {
            let totalR = 0, totalG = 0, totalB = 0;
            let count = 0;

            // Sum up all pixel values in the block
            for (let dx = 0; dx < blockSize; dx++) {
                for (let dy = 0; dy < blockSize; dy++) {
                    if (x + dx < faceW && y + dy < faceH) { // Check boundary
                        let idx = ((y + dy) * faceW + (x + dx)) * 4;
                        totalR += faceImg.pixels[idx];
                        totalG += faceImg.pixels[idx + 1];
                        totalB += faceImg.pixels[idx + 2];
                        count++;
                    }
                }
            }

            // Calculate average color of the block
            let avgR = totalR / count;
            let avgG = totalG / count;
            let avgB = totalB / count;

            // Set all pixels in the block to the average color
            for (let dx = 0; dx < blockSize; dx++) {
                for (let dy = 0; dy < blockSize; dy++) {
                    if (x + dx < faceW && y + dy < faceH) {
                        let idx = ((y + dy) * faceW + (x + dx)) * 4;
                        faceImg.pixels[idx] = avgR;
                        faceImg.pixels[idx + 1] = avgG;
                        faceImg.pixels[idx + 2] = avgB;
                    }
                }
            }
        }
    }
    faceImg.updatePixels();
}


// Function to draw faces
function drawFaces(detections) {
    push();
    translate(20, 4 * h + 170);
    for (let i = 0; i < detections.length; i++) {
        let x = detections[i].alignedRect._box._x;
        let y = detections[i].alignedRect._box._y;
        let width = detections[i].alignedRect._box._width;
        let height = detections[i].alignedRect._box._height;
        // Extract the face area from the video
        let faceImg = faceCapture.get(x, y, width, height);
        faceImg.loadPixels();

        let faceW = Math.floor(faceImg.width);
        let faceH = Math.floor(faceImg.height);

        switch (currentMode) {
            case 'NORMAL':
                // Just draw the detected face area
                drawFaceRect(x, y, width, height);
                break;
            case 'GRAYSCALE':
                applyGrayscaletoFace(faceImg, faceW, faceH);
                break;
            case 'BLUR':
                applyGaussianBlur(faceImg, faceW, faceH);
                break;
            case 'COLOR_CONVERSION':
                applyHSVtoFace(faceImg, faceW, faceH);
                break;
            case 'PIXELATE':
                applyPixelation(faceImg, faceW, faceH);
                break;
        }
        faceImg.updatePixels();
        // Draw the grayscale face area back onto the canvas
        image(faceImg, x, y);
    }
    pop();
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

        if (r == max) h = (g == min ? 5 + bPrime : 1 - gPrime);
        else if (g == max) h = (b == min ? 1 + rPrime : 3 - bPrime);
        else if (b == max) h = (r == min ? 3 + gPrime : 5 - rPrime);

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
