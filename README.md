# Image Processing App

This project is a browser-based image processing application built with [p5.js](https://p5js.org/). It uses machine learning via [ml5.js](https://ml5js.org/), [TensorFlow.js](https://www.tensorflow.org/js), and [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection and manipulation. The app demonstrates various image effects and color space conversions on both uploaded images and a live webcam feed.

## Running the App

1. Clone or download this repository.
2. Open `index.html` in a modern browser that supports WebGL **or** serve this directory with a static server (e.g., `python3 -m http.server`) and navigate to `http://localhost:8000`.
3. Allow the browser to access the webcam when prompted to see live processing.

An internet connection is required so the external JavaScript libraries (ml5, TensorFlow.js) can be loaded.

## Features

- **Live webcam capture and image upload** for processing.
- **Face detection** with ml5/face-api.js and processing modes:
  - Normal view
  - Grayscale conversion
  - Gaussian blur
  - HSV color conversion
  - Pixelation
- **Grayscale conversion** with brightness boost.
- **RGB channel separation** and segmentation using sliders.
- **HSV and YCbCr conversions** with per-channel segmentation controls.
- **Ripple effect** that distorts the image from the clicked point.

## Prerequisites

- A modern web browser with WebGL support.
- Internet access to load ml5.js, TensorFlow.js, and the face-api.js model files.

Open `index.html` (or visit the served address) and use the keyboard shortcuts shown in the console or UI buttons to explore the different features.
