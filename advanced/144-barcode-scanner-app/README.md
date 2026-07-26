# Barcode Scanner App 🔍
> Scan barcodes with your camera and look up product information instantly.

## Description
This web application transforms your device into a powerful barcode scanner. Utilizing modern browser APIs, it allows users to quickly scan product barcodes using their camera, retrieve associated product details, and maintain a history of all scanned items. It's designed for efficiency and ease of use, making product information readily accessible.

## Features
*   Real-time barcode scanning using the device's camera feed.
*   Support for common barcode formats (e.g., EAN, UPC).
*   Instant product information lookup based on scanned barcodes.
*   Display of detailed product information (e.g., name, description, image).
*   Persistent history log of all previously scanned items.
*   User-friendly interface for an intuitive scanning experience.
*   Option to clear the scan history.

## Tech Stack
*   HTML5
*   CSS3
*   JavaScript (Vanilla JS)
*   WebRTC (for Camera Access)
*   Barcode Detection API (Web API)
*   Third-party Product Lookup API (e.g., Open Food Facts, UPCitemdb)

## Key Concepts Demonstrated
*   **Camera API**: Efficiently accessing and streaming video from the user's device camera to enable live barcode scanning.
*   **Barcode Detection API**: Leveraging browser-native capabilities for robust and accurate barcode recognition from video streams or static images.
*   **Product Lookup**: Integrating with external APIs to fetch and display comprehensive product details based on the identified barcode data.
*   **History**: Implementing client-side data storage (e.g., LocalStorage) to persist and display a chronological log of all past scan activities.

## Getting Started
- Open `index.html` in browser (or npm install && npm start for React/Node)

## Screenshots
*(Placeholder: Add screenshots of the app in action here)*

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Full_stack_projects](https://github.com/Haris-Ahmed83/Full_stack_projects) series.
