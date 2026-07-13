# URL Shortener API 🔗
> A robust backend service to transform long URLs into concise, shareable short links.

## Description
This project implements a complete URL shortening service, allowing users to submit long URLs and receive unique, shortened versions. Built as a RESTful API, it efficiently handles URL storage, generation, and redirection, providing a core utility for web applications and content sharing.

## Features
*   Generate unique, compact short IDs for any given long URL.
*   Persist URL mappings in a database for reliable storage.
*   Redirect users from a short URL to its original long destination.
*   Validate input URLs to ensure proper format.
*   Expose a clean and intuitive RESTful API for interaction.
*   Efficiently handle URL creation and retrieval operations.

## Tech Stack
*   Express.js
*   MongoDB
*   Node.js

## Key Concepts Demonstrated
*   **Express.js**: Building a robust and scalable web server, defining API routes, and handling HTTP requests and responses.
*   **MongoDB**: Storing and managing URL mappings, including original URLs and their corresponding short IDs, leveraging its NoSQL flexibility.
*   **REST API**: Designing and implementing standard API endpoints (`POST /api/shorten`, `GET /:shortId`) for creating and retrieving/redirecting short URLs.
*   **Short ID Generation**: Developing a mechanism to create unique, compact, and non-colliding short identifiers for each submitted URL.
*   **Redirect**: Implementing server-side redirection (HTTP 302) to forward users from a short URL to its original destination URL efficiently.

## Getting Started
To get this project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Haris-Ahmed83/URL_Shortener_API.git
    cd URL_Shortener_API
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your MongoDB connection string and desired port:
    ```
    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    ```
    Replace `your_mongodb_connection_string` with your actual MongoDB connection URI.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The API will be running at `http://localhost:3000`.

## Screenshots
_Screenshots coming soon!_

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Full_stack_projects](https://github.com/Haris-Ahmed83/Full_stack_projects) series.
